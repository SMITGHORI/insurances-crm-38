
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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
  documents: {
    type: Map,
    of: {
      documentType: String,
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
    }
  },
  notes: [{
    content: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['general', 'sales', 'documentation', 'preference', 'follow-up'],
      default: 'general'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  }]
}, {
  timestamps: true
});

// Add pagination plugin
ClientSchema.plugin(mongoosePaginate);

// Create indexes for better performance
ClientSchema.index({ agentId: 1, status: 1 });
ClientSchema.index({ email: 1 });
ClientSchema.index({ clientId: 1 });
ClientSchema.index({ name: 1 });
ClientSchema.index({ phone: 1 });

module.exports = mongoose.model('Client', ClientSchema);
