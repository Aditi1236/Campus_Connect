// Administrator-only operations: statistics, user management, listing management.
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { ITEM_STATUSES } = require('../utils/constants');
const { httpError, asyncHandler, escapeRegex } = require('../utils/httpError');
const { buildItemFilter, getPagination, deleteItemCascade } = require('../utils/itemHelpers');

// GET /api/admin/dashboard  - statistics using MongoDB queries and aggregation
exports.getDashboard = asyncHandler(async (req, res) => {
  const [totalStudents, typeCounts, statusCounts, categoryCounts, pendingClaims, recentItems, recentClaims] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Item.aggregate([{ $group: { _id: '$itemType', count: { $sum: 1 } } }]),
    Item.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Item.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Claim.countDocuments({ status: 'pending' }),
    Item.find().sort('-createdAt').limit(5).populate('reportedBy', 'name'),
    Claim.find().sort('-createdAt').limit(5).populate('item', 'itemName').populate('claimant', 'name'),
  ]);

  const countOf = (rows, key) => (rows.find((r) => r._id === key) || { count: 0 }).count;

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalLost: countOf(typeCounts, 'lost'),
      totalFound: countOf(typeCounts, 'found'),
      pendingClaims,
      resolvedItems: countOf(statusCounts, 'resolved'),
      claimedItems: countOf(statusCounts, 'claimed'),
      activeItems: countOf(statusCounts, 'active'),
    },
    topCategories: categoryCounts.map((c) => ({ category: c._id, count: c.count })),
    recentItems,
    recentClaims,
  });
});

// GET /api/admin/users?q=
exports.getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { studentId: rx }];
  }
  if (req.query.role) filter.role = String(req.query.role);

  const users = await User.find(filter).sort('-createdAt');

  // How many listings has each user reported? (one aggregation instead of many queries)
  const counts = await Item.aggregate([{ $group: { _id: '$reportedBy', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  res.json({
    success: true,
    users: users.map((u) => ({ ...u.toObject(), listingsCount: countMap[String(u._id)] || 0 })),
  });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found.');
  if (String(user._id) === String(req.user._id)) throw httpError(400, 'You cannot delete your own account.');
  if (user.role === 'admin') throw httpError(400, 'Administrator accounts cannot be deleted here.');

  // Remove everything that belongs to this user
  const items = await Item.find({ reportedBy: user._id });
  for (const item of items) await deleteItemCascade(item);
  await Claim.deleteMany({ claimant: user._id });
  await User.deleteOne({ _id: user._id });

  res.json({ success: true, message: 'User and their data were deleted.' });
});

// GET /api/admin/items  (supports the same filters as the public list, plus closed items)
exports.getAllItems = asyncHandler(async (req, res) => {
  const filter = buildItemFilter(req.query, { includeClosed: true });
  const { page, limit, skip } = getPagination(req.query, 20);

  const [items, total] = await Promise.all([
    Item.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('reportedBy', 'name email studentId'),
    Item.countDocuments(filter),
  ]);
  res.json({ success: true, items, total, page, pages: Math.ceil(total / limit) || 1 });
});

// PUT /api/admin/items/:id/status
exports.updateItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ITEM_STATUSES.includes(status)) throw httpError(400, 'Invalid status.');
  const item = await Item.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!item) throw httpError(404, 'Item not found.');
  res.json({ success: true, message: 'Item status updated', item });
});

// DELETE /api/admin/items/:id  - remove inappropriate or duplicate listings
exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw httpError(404, 'Item not found.');
  await deleteItemCascade(item);
  res.json({ success: true, message: 'Listing removed' });
});
