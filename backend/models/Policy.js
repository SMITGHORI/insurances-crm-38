
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PolicySchema = new Schema({
  policyNumber: {
    type: String,
    unique: true,
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['health', 'life', 'auto', 'home', 'travel', 'business']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  premium: {
    type: Number,
    required: true
  },
  coverageAmount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  renewalDate: Date,
  paymentFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'semi-annual', 'annual'],
    default: 'annual'
  },
  beneficiaries: [{
    name: String,
    relationship: String,
    percentage: Number
  }],
  terms: {
    deductible: Number,
    coPayment: Number,
    maximumLimit: Number
  }
}, {
  timestamps: true
});

PolicySchema.index({ agentId: 1, status: 1 });
PolicySchema.index({ clientId: 1 });
PolicySchema.index({ policyNumber: 1 });

module.exports = mongoose.model('Policy', PolicySchema);
