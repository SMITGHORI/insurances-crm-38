
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = mongoose;

const ClientSchema = new Schema({
  clientId: {
    type: String,
    unique: true,
    required: true
  },
  clientType: {
    type: String,
    enum: ['individual', 'corporate', 'group'],
    required: true
  },
  // Common fields for all client types
  name: {
    type: String,
    required: false, // Will be generated from other fields
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
  altPhone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: false // Made optional to allow unassigned clients
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospective', 'pending'],
    default: 'prospective'
  },
  source: {
    type: String,
    enum: ['referral', 'website', 'social', 'campaign', 'lead', 'direct', 'other'],
    default: 'direct'
  },
  notes: {
    type: String
  },
  
  // Individual client specific fields
  firstName: {
    type: String,
    required: function() { return this.clientType === 'individual'; }
  },
  lastName: {
    type: String,
    required: function() { return this.clientType === 'individual'; }
  },
  dob: {
    type: String, // Store as string to match frontend format
    required: function() { return this.clientType === 'individual'; }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: function() { return this.clientType === 'individual'; }
  },
  panNumber: {
    type: String,
    required: function() { return this.clientType === 'individual'; }
  },
  aadharNumber: {
    type: String
  },
  occupation: String,
  annualIncome: Number,
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed']
  },
  nomineeName: String,
  nomineeRelation: String,
  nomineeContact: String,

  // Corporate client specific fields
  companyName: {
    type: String,
    required: function() { return this.clientType === 'corporate'; }
  },
  registrationNo: {
    type: String,
    required: function() { return this.clientType === 'corporate'; }
  },
  gstNumber: String,
  industry: {
    type: String,
    enum: ['IT', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Education', 'Hospitality', 'Construction', 'Transport', 'Agriculture', 'Other'],
    required: function() { return this.clientType === 'corporate'; }
  },
  employeeCount: {
    type: Number,
    required: function() { return this.clientType === 'corporate'; }
  },
  turnover: Number,
  yearEstablished: Number,
  website: String,
  contactPersonName: {
    type: String,
    required: function() { return this.clientType === 'corporate'; }
  },
  contactPersonDesignation: {
    type: String,
    required: function() { return this.clientType === 'corporate'; }
  },
  contactPersonEmail: {
    type: String,
    required: function() { return this.clientType === 'corporate'; }
  },
  contactPersonPhone: {
    type: String,
    required: function() { return this.clientType === 'corporate'; }
  },

  // Group client specific fields
  groupName: {
    type: String,
    required: function() { return this.clientType === 'group'; }
  },
  groupType: {
    type: String,
    enum: ['family', 'association', 'trust', 'society', 'community', 'other'],
    required: function() { return this.clientType === 'group'; }
  },
  memberCount: {
    type: Number,
    required: function() { return this.clientType === 'group'; }
  },
  primaryContactName: {
    type: String,
    required: function() { return this.clientType === 'group'; }
  },
  relationshipWithGroup: String,
  registrationID: String,
  groupFormationDate: String,
  groupCategory: {
    type: String,
    enum: ['general', 'religious', 'educational', 'professional', 'social', 'other']
  },
  groupPurpose: String,

  // Policy and premium tracking
  totalPolicies: {
    type: Number,
    default: 0
  },
  totalPremium: {
    type: Number,
    default: 0
  },
  
  // Document management
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
  
  // Notes system
  clientNotes: [{
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

// Create indexes for better performance and search
ClientSchema.index({ agentId: 1, status: 1 });
ClientSchema.index({ email: 1 });
ClientSchema.index({ clientId: 1 });
ClientSchema.index({ name: 1 });
ClientSchema.index({ phone: 1 });
ClientSchema.index({ clientType: 1 });
ClientSchema.index({ status: 1 });

// Text search index for better search functionality
ClientSchema.index({
  name: 'text',
  email: 'text',
  phone: 'text',
  clientId: 'text'
});

// Pre-save middleware to generate name field
ClientSchema.pre('save', function(next) {
  if (this.clientType === 'individual') {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  } else if (this.clientType === 'corporate') {
    this.name = this.companyName;
  } else if (this.clientType === 'group') {
    this.name = this.groupName;
  }
  next();
});

module.exports = mongoose.model('Client', ClientSchema);
