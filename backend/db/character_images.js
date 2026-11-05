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

// El Content-Type lo manda el cliente y se puede falsear: se comprueban los primeros bytes del fichero.
function firmaValida(buf, mime) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return false;
  switch (mime) {
    case "image/jpeg": return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case "image/png": return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/gif": return ["GIF87a", "GIF89a"].includes(buf.subarray(0, 6).toString("latin1"));
    case "image/webp": return buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP";
    default: return false;
  }
}

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
  if (!firmaValida(buffer, mimeType)) throw new ImageError("El archivo no es una imagen válida del formato indicado.");

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

module.exports = { listImages, addImage, removeImage, removeFilesOf, ImageError, EXTENSIONS, firmaValida };
