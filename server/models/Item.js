const mongoose = require('mongoose');
const { CATEGORIES, ITEM_TYPES, ITEM_STATUSES } = require('../utils/constants');

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: [true, 'Item name is required'], trim: true, maxlength: 80 },
    category: { type: String, required: [true, 'Category is required'], enum: CATEGORIES },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 1000 },
    itemType: { type: String, required: true, enum: ITEM_TYPES },
    location: { type: String, required: [true, 'Location is required'], trim: true, maxlength: 120 },
    date: { type: Date, required: [true, 'Date is required'] },
    image: { type: String, default: '' }, // path such as /uploads/xyz.jpg
    // Private identifying details - only shown to the owner and admins (prevents fraudulent claims)
    additionalDetails: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: ITEM_STATUSES, default: 'active' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Indexes make filtering and sorting faster
itemSchema.index({ itemType: 1, status: 1, createdAt: -1 });
itemSchema.index({ reportedBy: 1 });
itemSchema.index({ category: 1 });

module.exports = mongoose.model('Item', itemSchema);
