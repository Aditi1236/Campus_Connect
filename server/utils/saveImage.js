// Saves / deletes item photographs.
// STORAGE_MODE=local     -> file is written to server/uploads and path looks like /uploads/abc.jpg
// STORAGE_MODE=database  -> file bytes are stored in MongoDB (Image model), path looks like /api/images/<id>
// "database" mode is useful on free hosts (e.g. Render) whose disk is wiped on every deploy.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Image = require('../models/Image');
const { httpError } = require('./httpError');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const EXT_BY_TYPE = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

// Check the first bytes of the file ("magic numbers") so renamed non-image files are rejected.
function looksLikeImage(buffer, mimetype) {
  if (!buffer || buffer.length < 12) return false;
  if (mimetype === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8;
  if (mimetype === 'image/png') return buffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
  if (mimetype === 'image/webp') {
    return buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';
  }
  return false;
}

async function saveImage(file) {
  if (!file) return '';
  if (!looksLikeImage(file.buffer, file.mimetype)) {
    throw httpError(400, 'The uploaded file is not a valid image.');
  }
  if (process.env.STORAGE_MODE === 'database') {
    const doc = await Image.create({ data: file.buffer, contentType: file.mimetype });
    return `/api/images/${doc._id}`;
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT_BY_TYPE[file.mimetype]}`;
  await fs.promises.writeFile(path.join(UPLOAD_DIR, fileName), file.buffer);
  return `/uploads/${fileName}`;
}

// Removes a previously stored image. Never throws, because a missing file should not block a delete.
async function deleteImage(imagePath) {
  try {
    if (!imagePath) return;
    if (imagePath.startsWith('/uploads/')) {
      await fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(imagePath)));
    } else if (imagePath.startsWith('/api/images/')) {
      await Image.findByIdAndDelete(imagePath.split('/').pop());
    }
  } catch (err) {
    /* ignore - file already gone */
  }
}

module.exports = { saveImage, deleteImage };
