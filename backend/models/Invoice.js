
const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  clientPhone: String,
  clientAddress: String,
  policyId: String,
  policyNumber: String,
  insuranceType: String,
  agentId: String,
  agentName: String,
  issueDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  notes: String,
  paymentTerms: String,
  paymentMethod: String,
  paymentDate: Date,
  transactionId: String,
  premiumType: String,
  coverageStartDate: Date,
  coverageEndDate: Date,
  policyType: String,
  sumInsured: String,
  deductible: String,
  gstNumber: String,
  panNumber: String,
  premiumPeriod: String,
  customFields: {
    type: Map,
    of: String
  },
  history: [{
    action: String,
    date: Date,
    user: String,
    details: String
  }],
  sentAt: Date,
  paidAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ agentId: 1 });

// Update overdue status before saving
invoiceSchema.pre('save', function(next) {
  if (this.status === 'sent' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  next();
});

// Virtual for days until due
invoiceSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const timeDiff = this.dueDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for payment status
invoiceSchema.virtual('paymentStatus').get(function() {
  if (this.status === 'paid') return 'paid';
  if (this.status === 'overdue') return 'overdue';
  if (this.daysUntilDue <= 3 && this.daysUntilDue >= 0) return 'due-soon';
  return 'normal';
});

module.exports = mongoose.model('Invoice', invoiceSchema);
