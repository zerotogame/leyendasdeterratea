const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const pool = require("./db");

const IMAGES_DIR = path.join(__dirname, "..", "images");
const SUBDIR = "characters";
const MAX_IMAGES = 12;

const EXTENSIONS = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"
};

class ImageError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function listImages(characterId) {
  const result = await pool.query(
    "SELECT id, file FROM character_images WHERE character_id = $1 ORDER BY position, id",
    [characterId]
  );
  return result.rows;
}

// Guarda el fichero en images/characters/ y la referencia en la BD
async function addImage(characterId, buffer, mimeType) {
  const ext = EXTENSIONS[mimeType];
  if (!ext) throw new ImageError("Formato no admitido: usa JPG, PNG, WEBP o GIF.");
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new ImageError("La imagen está vacía.");

  const owner = await pool.query("SELECT 1 FROM characters WHERE id = $1", [characterId]);
  if (!owner.rowCount) throw new ImageError("Personaje no encontrado", 404);

  const count = await pool.query("SELECT COUNT(*)::int AS n FROM character_images WHERE character_id = $1", [characterId]);
  if (count.rows[0].n >= MAX_IMAGES) throw new ImageError(`Máximo ${MAX_IMAGES} imágenes por personaje.`);

  const file = `${SUBDIR}/${characterId}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  await fs.mkdir(path.join(IMAGES_DIR, SUBDIR), { recursive: true });
  await fs.writeFile(path.join(IMAGES_DIR, file), buffer);

  try {
    const inserted = await pool.query(
      `INSERT INTO character_images (character_id, file, position)
       VALUES ($1, $2, COALESCE((SELECT MAX(position) FROM character_images WHERE character_id = $1), 0) + 1)
       RETURNING id, file`,
      [characterId, file]
    );
    return inserted.rows[0];
  } catch (error) {
    await fs.unlink(path.join(IMAGES_DIR, file)).catch(() => {});
    throw error;
  }
}

async function removeImage(characterId, imageId) {
  const deleted = await pool.query(
    "DELETE FROM character_images WHERE id = $1 AND character_id = $2 RETURNING file",
    [imageId, characterId]
  );
  if (!deleted.rowCount) return false;
  await fs.unlink(path.join(IMAGES_DIR, deleted.rows[0].file)).catch(() => {});
  return true;
}

// Al borrar un personaje las filas caen en cascada; aquí se limpian los ficheros
async function removeFilesOf(characterId) {
  const images = await listImages(characterId);
  await Promise.all(images.map((i) => fs.unlink(path.join(IMAGES_DIR, i.file)).catch(() => {})));
}

module.exports = { listImages, addImage, removeImage, removeFilesOf, ImageError, EXTENSIONS };
