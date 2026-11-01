// Helpers used by both the student item routes and the admin item routes.
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { deleteImage } = require('./saveImage');
const { escapeRegex } = require('./httpError');

// Turns query-string parameters (?q=bag&category=Keys...) into a MongoDB filter.
function buildItemFilter(query, { includeClosed = false } = {}) {
  const filter = {};
  const { q, category, itemType, location, date, status } = query;

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ itemName: rx }, { description: rx }, { location: rx }, { category: rx }];
  }
  if (category) filter.category = String(category);
  if (itemType) filter.itemType = String(itemType);
  if (location) filter.location = new RegExp(escapeRegex(location), 'i');

  if (date) {
    // Match any item whose date falls on that calendar day
    const start = new Date(`${date}T00:00:00.000Z`);
    if (!isNaN(start)) {
      filter.date = { $gte: start, $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
    }
  }

  if (status && status !== 'all') filter.status = String(status);
  else if (!status && !includeClosed) filter.status = { $ne: 'closed' };

  return filter;
}

// Reads ?page=&limit= safely
function getPagination(query, defaultLimit = 12) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

// Deletes an item together with its claims and its stored photograph.
async function deleteItemCascade(item) {
  await Claim.deleteMany({ item: item._id });
  await deleteImage(item.image);
  await Item.deleteOne({ _id: item._id });
}

module.exports = { buildItemFilter, getPagination, deleteItemCascade };
