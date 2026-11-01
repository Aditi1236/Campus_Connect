// Values shared by models, controllers and validation.
const CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'ID Cards & Documents',
  'Wallets & Bags',
  'Keys',
  'Clothing & Accessories',
  'Sports Equipment',
  'Water Bottles & Lunch Boxes',
  'Others',
];
const ITEM_TYPES = ['lost', 'found'];
const ITEM_STATUSES = ['active', 'claimed', 'resolved', 'closed'];
const CLAIM_STATUSES = ['pending', 'approved', 'rejected'];

module.exports = { CATEGORIES, ITEM_TYPES, ITEM_STATUSES, CLAIM_STATUSES };
