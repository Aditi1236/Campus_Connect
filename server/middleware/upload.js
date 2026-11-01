// Multer configuration for item photographs.
// Files are kept in memory first; utils/saveImage.js then decides where to store them.
const multer = require('multer');
const { httpError } = require('../utils/httpError');

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(httpError(400, 'Only JPG, PNG or WEBP images are allowed.'));
    }
    cb(null, true);
  },
});

// Wrapper that converts Multer errors into friendly messages
const uploadItemImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(httpError(400, 'Image is too large. Maximum size is 5 MB.'));
    if (err instanceof multer.MulterError) return next(httpError(400, 'Invalid file upload. Send one image in the "image" field.'));
    next(err);
  });
};

module.exports = { uploadItemImage };
