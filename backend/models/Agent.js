
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Agent Document Schema
 * Embedded document for agent files and documents
 */
const AgentDocumentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  type: {
    type: String,
    required: true,
    enum: ['license', 'contract', 'certification', 'id_proof', 'address_proof', 'bank_details', 'resume', 'other'],
    default: 'other'
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, { _id: true });

/**
 * Agent Note Schema
 * Embedded document for agent notes and comments
 */
const AgentNoteSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, { _id: true });

/**
 * Personal Information Schema
 * Embedded document for agent personal details
 */
const PersonalInfoSchema = new Schema({
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  nationality: {
    type: String,
    trim: true,
    maxlength: 100
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', 'separated']
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: 50
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    }
  }
}, { _id: false });

/**
 * Address Schema
 * Embedded document for agent address information
 */
const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'USA'
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  }
}, { _id: false });

/**
 * Bank Details Schema
 * Embedded document for agent banking information
 */
const BankDetailsSchema = new Schema({
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  routingNumber: {
    type: String,
    required: true,
    trim: true
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings'],
    default: 'checking'
  },
  accountHolderName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  swiftCode: {
    type: String,
    trim: true,
    uppercase: true
  }
}, { _id: false });

/**
 * Performance Targets Schema
 */
const PerformanceTargetsSchema = new Schema({
  policies: {
    type: Number,
    min: 0,
    required: true
  },
  premium: {
    type: Number,
    min: 0,
    required: true
  }
}, { _id: false });

/**
 * Education Schema
 */
const EducationSchema = new Schema({
  degree: {
    type: String,
    trim: true,
    maxlength: 100
  },
  institution: {
    type: String,
    trim: true,
    maxlength: 100
  },
  graduationYear: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear()
  },
  field: {
    type: String,
    trim: true,
    maxlength: 100
  }
}, { _id: false });

/**
 * Experience Schema
 */
const ExperienceSchema = new Schema({
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  position: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: false });

/**
 * Certification Schema
 */
const CertificationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  issuer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  certificateNumber: {
    type: String,
    trim: true,
    maxlength: 50
  }
}, { _id: false });

/**
 * Main Agent Schema
 */
const AgentSchema = new Schema({
  agentId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'onboarding', 'terminated', 'suspended'],
    default: 'onboarding',
    index: true
  },
  role: {
    type: String,
    enum: ['agent', 'senior_agent', 'team_lead', 'manager'],
    default: 'agent'
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  region: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    index: true
  },
  territory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    index: true
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    index: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20,
    index: true
  },
  licenseExpiry: {
    type: Date,
    required: true,
    index: true
  },
  licenseState: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: 2
  },
  hireDate: {
    type: Date,
    required: true,
    index: true
  },
  terminationDate: {
    type: Date
  },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'commission_only'],
    default: 'full_time'
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  baseSalary: {
    type: Number,
    min: 0
  },
  commissionStructure: {
    type: String,
    enum: ['flat_rate', 'tiered', 'performance_based'],
    default: 'flat_rate'
  },
  personalInfo: PersonalInfoSchema,
  address: {
    type: AddressSchema,
    required: true
  },
  bankDetails: BankDetailsSchema,
  education: [EducationSchema],
  experience: [ExperienceSchema],
  certifications: [CertificationSchema],
  documents: [AgentDocumentSchema],
  notes: [AgentNoteSchema],
  performanceTargets: {
    monthly: PerformanceTargetsSchema,
    quarterly: PerformanceTargetsSchema,
    annual: PerformanceTargetsSchema
  },
  avatar: {
    type: String,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'import', 'api'],
      default: 'manual'
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    customFields: {
      type: Schema.Types.Mixed,
      default: {}
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
AgentSchema.index({ status: 1, region: 1 });
AgentSchema.index({ specialization: 1, status: 1 });
AgentSchema.index({ managerId: 1, status: 1 });
AgentSchema.index({ licenseExpiry: 1, status: 1 });
AgentSchema.index({ createdAt: -1 });
AgentSchema.index({ 'personalInfo.dateOfBirth': 1 });

// Text index for search functionality
AgentSchema.index({
  name: 'text',
  email: 'text',
  phone: 'text',
  licenseNumber: 'text'
});

// Virtual for full name
AgentSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for age
AgentSchema.virtual('age').get(function() {
  if (!this.personalInfo?.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for years of service
AgentSchema.virtual('yearsOfService').get(function() {
  if (!this.hireDate) return 0;
  const today = new Date();
  const hireDate = new Date(this.hireDate);
  return Math.floor((today - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for license status
AgentSchema.virtual('licenseStatus').get(function() {
  if (!this.licenseExpiry) return 'unknown';
  const today = new Date();
  const expiryDate = new Date(this.licenseExpiry);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (24 * 60 * 60 * 1000));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'valid';
});

// Pre-save middleware
AgentSchema.pre('save', function(next) {
  // Update lastActivity
  this.lastActivity = new Date();
  
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Ensure license number is uppercase
  if (this.licenseNumber) {
    this.licenseNumber = this.licenseNumber.toUpperCase();
  }
  
  next();
});

// Pre-find middleware to exclude deleted agents by default
AgentSchema.pre(/^find/, function(next) {
  // Only apply this filter if isDeleted is not explicitly set in the query
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Static methods
AgentSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

AgentSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ specialization, status: 'active' });
};

AgentSchema.statics.findByRegion = function(region) {
  return this.find({ region, status: 'active' });
};

AgentSchema.statics.findExpiringLicenses = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return this.find({
    licenseExpiry: { $lte: futureDate },
    status: 'active'
  });
};

// Instance methods
AgentSchema.methods.isLicenseValid = function() {
  if (!this.licenseExpiry) return false;
  return new Date(this.licenseExpiry) > new Date();
};

AgentSchema.methods.addNote = function(noteData) {
  this.notes.push(noteData);
  return this.save();
};

AgentSchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

AgentSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'terminated') {
    this.terminationDate = new Date();
  }
  return this.save();
};

// Export the model
module.exports = mongoose.model('Agent', AgentSchema);
