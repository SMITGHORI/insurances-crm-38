
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommissionSchema = new Schema({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  policyId: {
    type: Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paidDate: Date,
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'check', 'cash'],
    default: 'bank_transfer'
  },
  notes: String
}, {
  timestamps: true
});

CommissionSchema.index({ agentId: 1, status: 1 });
CommissionSchema.index({ policyId: 1 });

module.exports = mongoose.model('Commission', CommissionSchema);
