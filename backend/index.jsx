const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Server } = require("socket.io");

const { users, characters } = require("./data");
const { auth, SECRET } = require("./auth");
const {
  getCharacter,
  getCharacters
} = require("./db/character_db");

const { createCharacterByRules, updateCharacterByRules, RuleError } = require("./db/character_create");
const { createCharacterFromWeb } = require("./db/character_web");
const { addImage, removeImage, removeFilesOf, ImageError, EXTENSIONS } = require("./db/character_images");
const { levelUpOnce, spendStatPoints } = require("./db/character_level");
const rules = require("./rules/terratea");
const {
  RollError,
  createSession: createRollSession,
  rollStatInSession,
  rollVitalityInSession
} = require("./rules/roll_sessions");

const pool = require("./db/db");


const app = express();


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());
app.use(express.json());

const allowedCharacterFields = [
  "name",
  "class_id",
  "race_id",
  "height",
  "weight",
  "alignment",
  "sex",
  "age",
  "eyes",
  "hair",
  "marks",
  "level",
  "exp",
  "image"
];

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

async function updateCharacterById(characterId, updates) {
  const validEntries = Object.entries(updates).filter(([key, value]) => {
    if (!allowedCharacterFields.includes(key)) return false;
    return value !== undefined && value !== null && value !== "";
  });

  if (!validEntries.length) {
    return null;
  }

  const assignments = validEntries.map(([key], index) => `"${key}" = $${index + 1}`).join(", ");
  const values = validEntries.map(([, value]) => value);

  const result = await pool.query(
    `UPDATE characters SET ${assignments} WHERE id = $${validEntries.length + 1} RETURNING *`,
    [...values, characterId]
  );

  return result.rows[0] || null;
}

async function resolveObjectReference(objectId, objectName) {
  if (objectId) {
    const result = await pool.query(
      "SELECT id, name, price_copper, weight_kg, is_unique FROM public.objects WHERE id = $1 LIMIT 1",
      [objectId]
    );
    return result.rows[0] || null;
  }

  if (objectName) {
    const result = await pool.query(
      "SELECT id, name, price_copper, weight_kg, is_unique FROM public.objects WHERE LOWER(name) = LOWER($1) LIMIT 1",
      [objectName.trim()]
    );
    return result.rows[0] || null;
  }

  return null;
}

async function getCharacterItemEntry(characterId, objectId) {
  const result = await pool.query(
    "SELECT character_id, object_id, quantity FROM public.character_object WHERE character_id = $1 AND object_id = $2 LIMIT 1",
    [characterId, objectId]
  );
  return result.rows[0] || null;
}

/* LOGIN */
/*app.post("/login", (req, res) => {
  const user = users.find(u => u.email === req.body.email);
  if (!user) return res.sendStatus(401);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET
  );

  res.json({ token });
});
*/

/* REGISTRO DE JUGADORES: siempre rol PLAYER; MASTER/ADMIN no se pueden pedir desde fuera */
app.post("/register", async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  const at = email.indexOf("@");
  if (at < 1 || at !== email.lastIndexOf("@") || !email.slice(at).includes(".") || /\s/.test(email) || email.length > 254) {
    return res.status(400).json({ error: "email inválido" });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: "la contraseña debe tener entre 8 y 72 caracteres" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, 'PLAYER')
       ON CONFLICT DO NOTHING RETURNING id, email, role`,
      [email, hash]
    );
    if (!result.rows.length) return res.status(409).json({ error: "ese email ya está registrado" });

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    return res.status(201).json({ token, user });
  } catch (error) {
    console.error("Error registering user", error);
    return res.status(500).json({ error: "database error" });
  }
});

app.use('/images', express.static('images'));
app.post("/login", (req, res) => {
  return res.json({ token: jwt.sign(
    { id: 1, role: "MASTER" },
    SECRET
  )});
});

/* GET CHARACTER */
app.get("/characters/:id", async (req, res) => {
  const char = await getCharacter(req.params.id);
  res.json(char);
});

app.get("/characters", async (req, res) => {
  console.log("Fetching all characters");

  const chars = await getCharacters();
  
  res.json(chars);
});

// Resumen ligero de los personajes de un usuario (para la lista de terratea-web)
app.get("/users/:userId/characters", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.level, r.name AS race, cl.name AS class,
         (SELECT file FROM character_images WHERE character_id = c.id ORDER BY position, id LIMIT 1) AS image
       FROM characters c
       JOIN races r ON r.id = c.race_id
       JOIN classes cl ON cl.id = c.class_id
       WHERE c.user_id = $1
       ORDER BY c.id DESC`,
      [req.params.userId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Error listing user characters", error);
    return res.status(500).json({ error: "database error" });
  }
});

app.post("/characters", async (req, res) => {
  try {
    const { id, rolls } = await createCharacterByRules(req.body || {});
    const created = await getCharacter(id);
    return res.status(201).json({ ...created, rolls });
  } catch (error) {
    if (error instanceof RuleError) {
      return res.status(400).json({ error: error.message, errors: error.errors });
    }

    console.error("Error creating character", error);
    return res.status(500).json({ error: "database error" });
  }
});

// Personajes que llegan ya tirados desde el creador de terratea-web
app.post("/characters/web", async (req, res) => {
  try {
    const id = await createCharacterFromWeb(req.body || {});
    return res.status(201).json(await getCharacter(id));
  } catch (error) {
    if (error instanceof RuleError) {
      return res.status(400).json({ error: error.message, errors: error.errors });
    }

    console.error("Error creating web character", error);
    return res.status(500).json({ error: "database error" });
  }
});

app.delete("/characters/:id", async (req, res) => {
  try {
    await removeFilesOf(req.params.id);
    await pool.query("DELETE FROM public.character_object WHERE character_id = $1", [req.params.id]);
    const result = await pool.query("DELETE FROM characters WHERE id = $1 RETURNING *", [req.params.id]);

    if (!result.rowCount) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    return res.json({ deleted: result.rows[0] });
  } catch (error) {
    console.error("Error deleting character", error);
    return res.status(500).json({ error: "database error" });
  }
});

app.get("/classes", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM public.classes ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching classes", error);
    res.status(500).json({ error: "database error" });
  }
});

app.get("/races", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM public.races ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching races", error);
    res.status(500).json({ error: "database error" });
  }
});

// Datos de una raza: carga máxima, salvaciones por tramo de nivel y rasgos
app.get("/races/:id", async (req, res) => {
  try {
    const race = await pool.query("SELECT id, name, max_carry_kg FROM public.races WHERE id = $1", [req.params.id]);

    if (!race.rowCount) {
      return res.status(404).json({ error: "Raza no encontrada" });
    }

    const [saves, traits] = await Promise.all([
      pool.query(
        "SELECT level_min, level_max, save_id, value FROM public.race_saves WHERE race_id = $1 ORDER BY level_min, save_id",
        [req.params.id]
      ),
      pool.query(
        "SELECT kind, name, description FROM public.race_traits WHERE race_id = $1 ORDER BY kind ASC, id",
        [req.params.id]
      )
    ]);

    res.json({
      ...race.rows[0],
      max_carry_kg: race.rows[0].max_carry_kg == null ? null : Number(race.rows[0].max_carry_kg),
      ranges: rules.raceRules(race.rows[0].name),
      saves: saves.rows,
      traits: traits.rows
    });
  } catch (error) {
    console.error("Error fetching race", error);
    res.status(500).json({ error: "database error" });
  }
});

// Datos de una clase: reglas generales, tabla de experiencia y habilidades
app.get("/classes/:id", async (req, res) => {
  try {
    const clase = await pool.query("SELECT * FROM public.classes WHERE id = $1", [req.params.id]);

    if (!clase.rowCount) {
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    const [experience, abilities] = await Promise.all([
      pool.query(
        "SELECT level, required_experience FROM public.class_experience WHERE class_id = $1 ORDER BY level",
        [req.params.id]
      ),
      pool.query(
        "SELECT level, name, action, description FROM public.class_abilities WHERE class_id = $1 ORDER BY level, id",
        [req.params.id]
      )
    ]);

    res.json({ ...clase.rows[0], experience: experience.rows, abilities: abilities.rows });
  } catch (error) {
    console.error("Error fetching class", error);
    res.status(500).json({ error: "database error" });
  }
});

app.get("/catalog", async (req, res) => {
  try {
    const [stats, saves, movements] = await Promise.all([
      pool.query("SELECT id, name FROM public.stat_definitions ORDER BY id"),
      pool.query("SELECT id, name FROM public.save_definitions ORDER BY id"),
      pool.query("SELECT id, name FROM public.movement_definitions ORDER BY id")
    ]);
    res.json({ stats: stats.rows, saves: saves.rows, movements: movements.rows });
  } catch (error) {
    console.error("Error fetching catalog", error);
    res.status(500).json({ error: "database error" });
  }
});

app.get("/objects", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, price_copper, weight_kg, is_unique FROM public.objects ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching objects", error);
    res.status(500).json({ error: "database error" });
  }
});

// Imágenes de la ficha: el cuerpo es el fichero tal cual (Content-Type image/*), sin multipart
app.post("/characters/:id/images", express.raw({ type: Object.keys(EXTENSIONS), limit: "8mb" }), async (req, res) => {
  try {
    const image = await addImage(req.params.id, req.body, req.get("content-type")?.split(";")[0]);
    return res.status(201).json(image);
  } catch (error) {
    if (error instanceof ImageError) return res.status(error.status).json({ error: error.message });
    console.error("Error uploading character image", error);
    return res.status(500).json({ error: "database error" });
  }
});

app.delete("/characters/:id/images/:imageId", async (req, res) => {
  try {
    if (!(await removeImage(req.params.id, req.params.imageId))) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }
    return res.json({ deleted: Number(req.params.imageId) });
  } catch (error) {
    console.error("Error deleting character image", error);
    return res.status(500).json({ error: "database error" });
  }
});

app.put("/characters/:id", async (req, res) => {
  try {
    const updated = await updateCharacterByRules(req.params.id, req.body || {});

    if (!updated) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const character = await getCharacter(req.params.id);
    return res.json(character);
  } catch (error) {
    if (error instanceof RuleError) {
      return res.status(400).json({ error: error.message, errors: error.errors });
    }

    console.error("Error updating character", error);
    return res.status(500).json({ error: "database error" });
  }
});

// ============================================================
// AÑADIR EXPERIENCIA A UN PERSONAJE
// ============================================================

// ============================================================
// AÑADIR EXPERIENCIA A UN PERSONAJE
// ============================================================

app.post("/characters/:id/experience", async (req, res) => {

  const client = await pool.connect();

  try {

    console.log(
      `Añadiendo experiencia al personaje ${req.params.id}`
    );


    // --------------------------------------------------------
    // 1. Validar cantidad de experiencia
    // --------------------------------------------------------

    const amount =
      Number(req.body?.amount ?? 0);


    if (!Number.isFinite(amount)) {

      return res.status(400).json({
        error: "La experiencia debe ser un número válido"
      });

    }


    if (amount <= 0) {

      return res.status(400).json({
        error: "La experiencia debe ser mayor que 0"
      });

    }


    // Máximo de experiencia que se puede añadir
    // en una sola operación.

    const MAX_EXP_PER_ACTION = 10000;


    if (amount > MAX_EXP_PER_ACTION) {

      return res.status(400).json({
        error:
          `No puedes añadir más de ${MAX_EXP_PER_ACTION} de experiencia de una vez`
      });

    }


    const validAmount =
      Math.floor(amount);


    // --------------------------------------------------------
    // 2. Iniciar transacción
    // --------------------------------------------------------

    await client.query("BEGIN");


    // --------------------------------------------------------
    // 3. Añadir experiencia
    // --------------------------------------------------------

    const result = await client.query(
      `
      UPDATE characters
      SET exp = exp + $1
      WHERE id = $2
      RETURNING *
      `,
      [
        validAmount,
        req.params.id
      ]
    );


    // --------------------------------------------------------
    // Personaje no encontrado
    // --------------------------------------------------------

    if (!result.rowCount) {

      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Personaje no encontrado"
      });

    }


    let character =
      result.rows[0];

    const startLevel = character.level;


    // --------------------------------------------------------
    // 4. Comprobar subidas de nivel
    // --------------------------------------------------------

    while (true) {

      const expResult = await client.query(
        `
        SELECT required_experience
        FROM class_experience
        WHERE class_id = $1
          AND level = $2
        LIMIT 1
        `,
        [
          character.class_id,
          character.level + 1
        ]
      );


      // ------------------------------------------------------
      // No existe el siguiente nivel
      // ------------------------------------------------------

      if (!expResult.rowCount) {

        break;

      }


      const requiredExperience =
        Number(
          expResult.rows[0].required_experience
        );


      // ------------------------------------------------------
      // No tiene suficiente experiencia
      // ------------------------------------------------------

      if (
        Number(character.exp) <
        requiredExperience
      ) {

        break;

      }


      // ------------------------------------------------------
      // Subir nivel
      // ------------------------------------------------------

      const leveled = await levelUpOnce(client, character.id);

      if (!leveled) {

        break;

      }


      character = leveled;

    }


    // --------------------------------------------------------
    // 5. Confirmar transacción
    // --------------------------------------------------------

    await client.query("COMMIT");


    // --------------------------------------------------------
    // 6. Obtener personaje completo
    // --------------------------------------------------------

    const updatedCharacter =
      await getCharacter(character.id);


    return res.json({
      ...updatedCharacter,
      levels_gained: updatedCharacter.level - startLevel
    });


  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Error adding experience:",
      error
    );

    return res.status(500).json({
      error: "database error"
    });


  } finally {

    client.release();

  }

});
// ============================================================
// SUBIR NIVEL MANUALMENTE
// ============================================================

app.post("/characters/:id/level-up", async (req, res) => {
  const client = await pool.connect();

  try {

    const amount =
      Number(req.body?.amount ?? 1);

    const validAmount =
      Number.isFinite(amount) && amount > 0
        ? Math.floor(amount)
        : 1;

    await client.query("BEGIN");

    let leveled = false;

    for (let i = 0; i < validAmount; i++) {
      const row = await levelUpOnce(client, req.params.id);

      if (!row) break;

      leveled = true;
    }

    const exists = leveled || (await client.query("SELECT 1 FROM characters WHERE id = $1", [req.params.id])).rowCount;

    if (!exists) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Personaje no encontrado"
      });
    }

    await client.query("COMMIT");

    const character =
      await getCharacter(req.params.id);

    return res.json(character);

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Error leveling up character",
      error
    );

    return res.status(500).json({
      error: "database error"
    });

  } finally {

    client.release();

  }
});

// Reparto de los puntos de característica ganados en los niveles 10 y 20
app.post("/characters/:id/stat-points", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await spendStatPoints(
      client,
      req.params.id,
      Number(req.body?.stat_id),
      Number(req.body?.points ?? 1)
    );

    if (result.notFound || result.error) {
      await client.query("ROLLBACK");
      return res.status(result.notFound ? 404 : 400).json({ error: result.error || "Personaje no encontrado" });
    }

    await client.query("COMMIT");
    return res.json(await getCharacter(req.params.id));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error spending stat points", error);
    return res.status(500).json({ error: "database error" });
  } finally {
    client.release();
  }
});

// Tiradas de creación: el servidor tira y recuerda el resultado para el alta
app.post("/rolls/session", async (req, res) => {
  try {
    const clase = await pool.query("SELECT id, min_stats FROM public.classes WHERE id = $1", [req.body?.class_id]);

    if (!clase.rowCount) {
      return res.status(400).json({ error: "Elige una clase antes de tirar los dados." });
    }

    res.status(201).json({ session: createRollSession(clase.rows[0].id, clase.rows[0].min_stats ?? {}) });
  } catch (error) {
    console.error("Error creating roll session", error);
    res.status(500).json({ error: "database error" });
  }
});

app.post("/rolls/:session/stat", async (req, res) => {
  try {
    const stat = await pool.query("SELECT name FROM public.stat_definitions WHERE id = $1", [req.body?.stat_id]);

    if (!stat.rowCount) {
      return res.status(400).json({ error: "Característica no encontrada." });
    }

    res.json(rollStatInSession(req.params.session, stat.rows[0].name));
  } catch (error) {
    if (error instanceof RollError) return res.status(400).json({ error: error.message });
    console.error("Error rolling stat", error);
    res.status(500).json({ error: "database error" });
  }
});

app.post("/rolls/:session/vitality", (req, res) => {
  try {
    res.json(rollVitalityInSession(req.params.session));
  } catch (error) {
    if (error instanceof RollError) return res.status(400).json({ error: error.message });
    console.error("Error rolling vitality", error);
    res.status(500).json({ error: "server error" });
  }
});

// Alineamientos válidos (lista cerrada)
app.get("/rules", (req, res) => {
  res.json({ alignments: rules.ALIGNMENTS, sexes: rules.SEXES });
});

app.post("/characters/:id/items", async (req, res) => {
  try {
    const { object_id, objectId, name, objectName, quantity } = req.body || {};
    const resolvedObject = await resolveObjectReference(object_id ?? objectId ?? null, name ?? objectName ?? null);

    if (!resolvedObject) {
      return res.status(404).json({ error: "Objeto no encontrado" });
    }

    const itemQuantity = Number(quantity ?? 1);
    if (!Number.isFinite(itemQuantity) || itemQuantity <= 0) {
      return res.status(400).json({ error: "La cantidad debe ser un número mayor que 0" });
    }

    const existing = await getCharacterItemEntry(req.params.id, resolvedObject.id);
    const nextQuantity = existing ? existing.quantity + itemQuantity : itemQuantity;

    if (resolvedObject.is_unique && nextQuantity > 1) {
      return res.status(400).json({ error: `"${resolvedObject.name}" es un objeto único: solo puede haber uno.` });
    }

    const result = await pool.query(
      `INSERT INTO public.character_object (character_id, object_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (character_id, object_id)
       DO UPDATE SET quantity = EXCLUDED.quantity
       RETURNING *`,
      [req.params.id, resolvedObject.id, nextQuantity]
    );

    const character = await getCharacter(req.params.id);
    return res.json({ item: result.rows[0], character });
  } catch (error) {
    console.error("Error adding item to character", error);
    return res.status(500).json({ error: "database error" });
  }
});

app.put("/characters/:id/items/:objectId", async (req, res) => {
  try {
    const quantity = Number(req.body?.quantity ?? 1);
    if (!Number.isFinite(quantity) || quantity < 0) {
      return res.status(400).json({ error: "La cantidad debe ser 0 o mayor" });
    }

    const unique = await pool.query("SELECT name FROM public.objects WHERE id = $1 AND is_unique", [req.params.objectId]);
    if (unique.rowCount && quantity > 1) {
      return res.status(400).json({ error: `"${unique.rows[0].name}" es un objeto único: solo puede haber uno.` });
    }

    const result = await pool.query(
      "UPDATE public.character_object SET quantity = $1 WHERE object_id = $2 AND character_id = $3 RETURNING *",
      [quantity, req.params.objectId, req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Objeto del inventario no encontrado" });
    }

    const character = await getCharacter(req.params.id);
    return res.json({ item: result.rows[0], character });
  } catch (error) {
    console.error("Error updating item", error);
    return res.status(500).json({ error: "database error" });
  }
});

app.delete("/characters/:id/items/:objectId", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM public.character_object WHERE object_id = $1 AND character_id = $2 RETURNING *",
      [req.params.objectId, req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Objeto del inventario no encontrado" });
    }

    const character = await getCharacter(req.params.id);
    return res.json({ deleted: result.rows[0], character });
  } catch (error) {
    console.error("Error deleting item", error);
    return res.status(500).json({ error: "database error" });
  }
});

// ============================================================
// OBTENER EXPERIENCIA NECESARIA PARA UN NIVEL
// ============================================================

app.get("/class-experience", async (req, res) => {

  const classId =
    parseInt(req.query.class_id, 10);

  const level =
    parseInt(req.query.level, 10);

  if (
    Number.isNaN(classId) ||
    Number.isNaN(level)
  ) {
    return res.status(400).json({
      error:
        "class_id and level are required numeric query params"
    });
  }

  const q = `
    SELECT required_experience
    FROM class_experience
    WHERE class_id = $1
      AND level = $2
    LIMIT 1
  `;

  try {

    const result =
      await pool.query(
        q,
        [
          classId,
          level
        ]
      );

    const required_experience =
      result.rows[0]?.required_experience ?? null;

    return res.json({
      required_experience
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "database error"
    });

  }
});

/* SOCKET AUTH */
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    socket.user = jwt.verify(token, SECRET);
    next();
  } catch {
    next(new Error("unauthorized"));
  }
});

/* SOCKET EVENTS */
io.on("connection", socket => {
  socket.on("update-attribute", ({ charId, attr, value }) => {
    const char = characters.find(c => c.id === charId);

    const isOwner = char.ownerId === socket.user.id;
    const isMaster = socket.user.role === "MASTER";

    if (!isOwner && !isMaster) return;

    char.attributes[attr] = value;

    io.emit("character-updated", char);
  });
});

// ============================================================
// ARRANCAR SERVIDOR
// ============================================================

server.listen(process.env.PORT || 3000, () => {
  console.log(
    "Backend en http://localhost:3000"
  );
});