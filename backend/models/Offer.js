
const mongoose = require('mongoose');
const { Schema } = mongoose;

const offerSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['discount', 'cashback', 'bonus_points', 'free_addon', 'premium_waiver', 'special_rate']
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    min: 0
  },
  applicableProducts: [{
    type: String,
    required: true
  }],
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  maxUsageCount: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  currentUsageCount: {
    type: Number,
    default: 0
  },
  minPremiumAmount: {
    type: Number,
    default: 0
  },
  maxPremiumAmount: {
    type: Number
  },
  targetAudience: {
    clientTypes: [{
      type: String,
      enum: ['individual', 'corporate', 'group']
    }],
    tierLevels: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }],
    locations: [{
      city: String,
      state: String
    }]
  },
  terms: {
    type: String,
    maxlength: 2000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stats: {
    totalViews: { type: Number, default: 0 },
    totalClaims: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
offerSchema.index({ type: 1, isActive: 1 });
offerSchema.index({ validFrom: 1, validUntil: 1 });
offerSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Offer', offerSchema);
