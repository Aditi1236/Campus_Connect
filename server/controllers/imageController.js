// Serves images stored in MongoDB (only used when STORAGE_MODE=database)
const mongoose = require('mongoose');
const Image = require('../models/Image');
const { httpError, asyncHandler } = require('../utils/httpError');

exports.getImage = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Image not found.');
  const image = await Image.findById(req.params.id);
  if (!image) throw httpError(404, 'Image not found.');
  res.set('Content-Type', image.contentType);
  res.set('Cache-Control', 'public, max-age=604800');
  res.send(image.data);
});
