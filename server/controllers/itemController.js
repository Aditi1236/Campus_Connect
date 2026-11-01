// CRUD for lost & found listings.
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { CATEGORIES, ITEM_TYPES } = require('../utils/constants');
const { httpError, asyncHandler } = require('../utils/httpError');
const { saveImage, deleteImage } = require('../utils/saveImage');
const { buildItemFilter, getPagination, deleteItemCascade } = require('../utils/itemHelpers');

const EDITABLE_STATUSES = ['active', 'closed']; // owners can only change items in these states

const isAdmin = (user) => user && user.role === 'admin';
const sameId = (a, b) => String(a && a._id ? a._id : a) === String(b && b._id ? b._id : b);

// Hide private "additionalDetails" from everyone except the owner and admins.
// This stops people from reading identifying details and making a fraudulent claim.
function serializeItem(item, user) {
  const obj = item.toObject ? item.toObject() : item;
  const isOwner = user && sameId(obj.reportedBy, user._id);
  if (!isOwner && !isAdmin(user)) delete obj.additionalDetails;
  return obj;
}

// Validates item fields. Throws a 400 error with a helpful message.
function validateItemFields(f, { requireType }) {
  if (requireType && !ITEM_TYPES.includes(f.itemType)) throw httpError(400, 'Item type must be "lost" or "found".');
  if (!f.itemName || f.itemName.length < 2) throw httpError(400, 'Item name must be at least 2 characters.');
  if (f.itemName.length > 80) throw httpError(400, 'Item name is too long (max 80 characters).');
  if (!CATEGORIES.includes(f.category)) throw httpError(400, 'Please choose a valid category.');
  if (!f.description || f.description.length < 10) throw httpError(400, 'Description must be at least 10 characters.');
  if (f.description.length > 1000) throw httpError(400, 'Description is too long (max 1000 characters).');
  if (!f.location) throw httpError(400, 'Location is required.');
  if (f.location.length > 120) throw httpError(400, 'Location is too long (max 120 characters).');
  const d = new Date(f.date);
  if (!f.date || isNaN(d)) throw httpError(400, 'Please enter a valid date.');
  if (d > new Date(Date.now() + 24 * 60 * 60 * 1000)) throw httpError(400, 'Date cannot be in the future.');
  if (f.additionalDetails && String(f.additionalDetails).length > 500) throw httpError(400, 'Additional details are too long (max 500 characters).');
}

// POST /api/items  (multipart/form-data, optional "image" file)
exports.createItem = asyncHandler(async (req, res) => {
  const { itemName, category, description, itemType, location, date, additionalDetails } = req.body;
  validateItemFields({ itemName, category, description, itemType, location, date, additionalDetails }, { requireType: true });

  const image = await saveImage(req.file);
  try {
    const item = await Item.create({
      itemName, category, description, itemType, location, date,
      additionalDetails: additionalDetails || '',
      image,
      reportedBy: req.user._id,
    });
    res.status(201).json({ success: true, message: `${itemType === 'lost' ? 'Lost' : 'Found'} item reported successfully`, item });
  } catch (err) {
    await deleteImage(image); // don't leave an orphan image if saving the item failed
    throw err;
  }
});

// GET /api/items?q=&category=&itemType=&location=&date=&status=&page=&limit=
exports.getItems = asyncHandler(async (req, res) => {
  const filter = buildItemFilter(req.query);
  const { page, limit, skip } = getPagination(req.query);

  const [items, total] = await Promise.all([
    Item.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('reportedBy', 'name'),
    Item.countDocuments(filter),
  ]);

  res.json({
    success: true,
    items: items.map((i) => serializeItem(i, req.user)),
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  });
});

// GET /api/items/my-listings
exports.getMyListings = asyncHandler(async (req, res) => {
  const items = await Item.find({ reportedBy: req.user._id }).sort('-createdAt');
  res.json({ success: true, items });
});

// GET /api/items/:id
exports.getItemById = asyncHandler(async (req, res) => {
  const populateFields = isAdmin(req.user) ? 'name email studentId' : 'name';
  const item = await Item.findById(req.params.id).populate('reportedBy', populateFields);
  if (!item) throw httpError(404, 'Item not found.');

  const isOwner = req.user && sameId(item.reportedBy, req.user._id);
  // Closed listings are hidden from the public
  if (item.status === 'closed' && !isOwner && !isAdmin(req.user)) throw httpError(404, 'Item not found.');

  let hasActiveClaim = false;
  if (req.user) {
    hasActiveClaim = !!(await Claim.exists({ item: item._id, claimant: req.user._id, status: { $in: ['pending', 'approved'] } }));
  }

  res.json({ success: true, item: serializeItem(item, req.user), isOwner: !!isOwner, hasActiveClaim });
});

// PUT /api/items/:id  (owner only)
exports.updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw httpError(404, 'Item not found.');
  if (!sameId(item.reportedBy, req.user._id)) throw httpError(403, 'You can only edit your own listings.');
  if (!EDITABLE_STATUSES.includes(item.status)) throw httpError(400, 'Claimed or resolved items can no longer be edited.');

  // Use the new value if one was sent, otherwise keep the old one
  const body = req.body;
  const merged = {
    itemName: body.itemName ?? item.itemName,
    category: body.category ?? item.category,
    description: body.description ?? item.description,
    location: body.location ?? item.location,
    date: body.date ?? item.date,
    additionalDetails: body.additionalDetails ?? item.additionalDetails,
  };
  validateItemFields(merged, { requireType: false });

  if (body.status !== undefined) {
    if (!EDITABLE_STATUSES.includes(body.status)) throw httpError(400, 'You can only set the status to "active" or "closed".');
    item.status = body.status;
  }

  Object.assign(item, merged);

  let newImage = '';
  if (req.file) {
    newImage = await saveImage(req.file);
    const oldImage = item.image;
    item.image = newImage;
    await item.save();
    await deleteImage(oldImage);
  } else {
    await item.save();
  }

  res.json({ success: true, message: 'Listing updated', item });
});

// DELETE /api/items/:id  (owner only; admins use /api/admin/items/:id)
exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw httpError(404, 'Item not found.');
  if (!sameId(item.reportedBy, req.user._id)) throw httpError(403, 'You can only delete your own listings.');
  if (!EDITABLE_STATUSES.includes(item.status)) throw httpError(400, 'Claimed or resolved items cannot be deleted.');

  await deleteItemCascade(item);
  res.json({ success: true, message: 'Listing deleted' });
});
