const mongoose = require('mongoose');
const { CLAIM_STATUSES } = require('../utils/constants');

const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    explanation: { type: String, required: [true, 'Explanation is required'], trim: true, minlength: [20, 'Explanation must be at least 20 characters'], maxlength: 1000 },
    identifyingDetails: { type: String, required: [true, 'Identifying details are required'], trim: true, maxlength: 500 },
    status: { type: String, enum: CLAIM_STATUSES, default: 'pending' },
    adminNote: { type: String, trim: true, maxlength: 300, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// A student can have only ONE pending claim per item (database-level safety net)
claimSchema.index(
  { item: 1, claimant: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);
claimSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Claim', claimSchema);
