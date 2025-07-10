
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClientSchema = new Schema({
  clientId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospective'],
    default: 'prospective'
  },
  totalPolicies: {
    type: Number,
    default: 0
  },
  totalPremium: {
    type: Number,
    default: 0
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  occupation: String,
  annualIncome: Number,
  notes: [{
    content: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

ClientSchema.index({ agentId: 1, status: 1 });
ClientSchema.index({ email: 1 });

module.exports = mongoose.model('Client', ClientSchema);
