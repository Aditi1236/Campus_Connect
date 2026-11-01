// Claim requests: students submit, admins review.
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const { ITEM_STATUSES } = require('../utils/constants');
const { httpError, asyncHandler, escapeRegex } = require('../utils/httpError');

// POST /api/claims
exports.createClaim = asyncHandler(async (req, res) => {
  const { item: itemId, explanation, identifyingDetails } = req.body;
  if (!itemId) throw httpError(400, 'Item is required.');
  if (!explanation || explanation.length < 20) throw httpError(400, 'Please explain why the item is yours (at least 20 characters).');
  if (!identifyingDetails) throw httpError(400, 'Please provide identifying details (colour, marks, contents, serial number...).');

  const item = await Item.findById(itemId);
  if (!item) throw httpError(404, 'Item not found.');
  if (item.itemType !== 'found') throw httpError(400, 'Claims can only be made for items reported as found.');
  if (item.status !== 'active') throw httpError(400, 'This item is no longer available to claim.');
  if (String(item.reportedBy) === String(req.user._id)) throw httpError(400, 'You cannot claim an item that you reported yourself.');

  // Prevent duplicate active claims from the same user
  const existing = await Claim.findOne({ item: item._id, claimant: req.user._id, status: { $in: ['pending', 'approved'] } });
  if (existing) throw httpError(409, 'You already have an active claim for this item.');

  const claim = await Claim.create({ item: item._id, claimant: req.user._id, explanation, identifyingDetails });
  res.status(201).json({ success: true, message: 'Claim submitted. An administrator will review it soon.', claim });
});

// GET /api/claims/my-claims
exports.getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ claimant: req.user._id })
    .sort('-createdAt')
    .populate('item', 'itemName image category location itemType status');
  res.json({ success: true, claims });
});

// GET /api/claims?status=&q=   (admin)
exports.getAllClaims = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && req.query.status !== 'all') filter.status = String(req.query.status);

  if (req.query.q) {
    // Search by item name or by claimant name / email / student ID
    const rx = new RegExp(escapeRegex(req.query.q), 'i');
    const [items, users] = await Promise.all([
      Item.find({ itemName: rx }).select('_id'),
      User.find({ $or: [{ name: rx }, { email: rx }, { studentId: rx }] }).select('_id'),
    ]);
    filter.$or = [{ item: { $in: items.map((i) => i._id) } }, { claimant: { $in: users.map((u) => u._id) } }];
  }

  const claims = await Claim.find(filter)
    .sort('-createdAt')
    .populate('claimant', 'name email studentId')
    .populate('reviewedBy', 'name')
    .populate({ path: 'item', select: 'itemName image category location itemType status additionalDetails date reportedBy', populate: { path: 'reportedBy', select: 'name studentId' } });

  res.json({ success: true, claims });
});

// PUT /api/claims/:id/status   (admin)   body: { status, adminNote, itemStatus? }
exports.updateClaimStatus = asyncHandler(async (req, res) => {
  const { status, adminNote, itemStatus } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw httpError(400, 'Status must be "approved" or "rejected".');
  if (itemStatus !== undefined && !ITEM_STATUSES.includes(itemStatus)) throw httpError(400, 'Invalid item status.');

  const claim = await Claim.findById(req.params.id);
  if (!claim) throw httpError(404, 'Claim not found.');
  if (claim.status !== 'pending') throw httpError(400, `This claim has already been ${claim.status}.`);

  const item = await Item.findById(claim.item);
  if (!item) throw httpError(404, 'The item for this claim no longer exists.');

  if (status === 'approved') {
    if (item.status !== 'active') throw httpError(400, 'This item is not active, so the claim cannot be approved.');
    item.status = itemStatus || 'claimed'; // approved claim => item becomes "claimed"
    await item.save();

    // Any other pending claims for the same item are automatically rejected
    await Claim.updateMany(
      { item: item._id, _id: { $ne: claim._id }, status: 'pending' },
      { status: 'rejected', reviewedBy: req.user._id, adminNote: 'Another claim for this item was approved.' }
    );
  } else if (itemStatus) {
    item.status = itemStatus;
    await item.save();
  }

  claim.status = status;
  claim.adminNote = adminNote || '';
  claim.reviewedBy = req.user._id;
  await claim.save();

  res.json({ success: true, message: `Claim ${status}`, claim, itemStatus: item.status });
});
