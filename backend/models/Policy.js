
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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
    ref: 'Agent'
  },
  assignedAgentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent'
  },
  type: {
    type: String,
    required: true,
    enum: ['health', 'life', 'auto', 'home', 'travel', 'business']
  },
  category: {
    type: String,
    enum: ['individual', 'family', 'group', 'corporate'],
    default: 'individual'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Expired', 'Cancelled', 'Pending', 'Proposal'],
    default: 'Proposal'
  },
  insuranceCompany: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  premium: {
    type: Number,
    required: true
  },
  sumAssured: {
    type: Number,
    required: true
  },
  coverageAmount: {
    type: Number,
    required: true
  },
  paymentFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'semi-annual', 'annual', 'yearly'],
    default: 'annual'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  maturityDate: Date,
  renewalDate: Date,
  gracePeriod: {
    type: Number,
    default: 30
  },
  policyTermYears: Number,
  premiumPaymentTermYears: Number,
  lockInPeriod: {
    type: Number,
    default: 0
  },
  gstNumber: String,
  discountPercentage: {
    type: Number,
    default: 0
  },
  nextYearPremium: Number,
  source: {
    type: String,
    enum: ['direct', 'referral', 'online', 'agent'],
    default: 'direct'
  },
  beneficiaries: [{
    name: String,
    relationship: String,
    percentage: Number
  }],
  nominees: [{
    name: String,
    relationship: String,
    dateOfBirth: Date,
    percentage: Number
  }],
  typeSpecificDetails: {
    type: Schema.Types.Mixed,
    default: {}
  },
  vehicleDetails: {
    make: String,
    model: String,
    year: Number,
    registrationNumber: String,
    engineNumber: String,
    chassisNumber: String
  },
  healthDetails: {
    medicalHistory: [String],
    preExistingConditions: [String],
    smoker: Boolean,
    alcoholConsumer: Boolean
  },
  travelDetails: {
    destination: String,
    duration: Number,
    purpose: String,
    coverage: [String]
  },
  terms: {
    deductible: Number,
    coPayment: Number,
    maximumLimit: Number
  },
  commission: {
    rate: Number,
    amount: Number,
    paid: {
      type: Boolean,
      default: false
    }
  },
  documents: [{
    documentType: {
      type: String,
      enum: ['policy_document', 'proposal_form', 'medical_report', 'claim_form', 'amendment', 'renewal', 'other']
    },
    name: String,
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  payments: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['cash', 'cheque', 'bank_transfer', 'credit_card', 'debit_card', 'upi', 'online']
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    notes: String,
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  renewals: [{
    renewalDate: Date,
    previousEndDate: Date,
    newEndDate: Date,
    premium: Number,
    commission: {
      rate: Number,
      amount: Number
    },
    renewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    renewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    note: String,
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add pagination plugin
PolicySchema.plugin(mongoosePaginate);

// Indexes for better performance
PolicySchema.index({ agentId: 1, status: 1 });
PolicySchema.index({ assignedAgentId: 1, status: 1 });
PolicySchema.index({ clientId: 1 });
PolicySchema.index({ policyNumber: 1 });
PolicySchema.index({ status: 1 });
PolicySchema.index({ type: 1 });
PolicySchema.index({ startDate: 1, endDate: 1 });
PolicySchema.index({ renewalDate: 1 });
PolicySchema.index({ createdAt: -1 });

// Generate policy number before saving
PolicySchema.pre('save', async function(next) {
  if (!this.policyNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.policyNumber = `POL-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Policy', PolicySchema);
