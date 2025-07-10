
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityId: {
    type: String,
    unique: true,
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['client', 'policy', 'claim', 'quotation', 'lead', 'agent', 'user', 'payment', 'document', 'plan', 'invoice', 'setting', 'offer', 'broadcast'],
    required: true
  },
  operation: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'error'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['super_admin', 'manager', 'agent'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  category: {
    type: String,
    enum: ['data_change', 'security_event', 'system_event', 'error_event'],
    default: 'data_change'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    method: String,
    endpoint: String,
    requestId: String,
    sessionId: String,
    device: String,
    browser: String,
    os: String
  },
  changeDetails: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    dataType: String
  }],
  beforeState: mongoose.Schema.Types.Mixed,
  afterState: mongoose.Schema.Types.Mixed,
  isSuccessful: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  duration: Number,
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientName: String,
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  agentName: String
}, {
  timestamps: true
});

// Indexes for better performance
activitySchema.index({ activityId: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ userId: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ isArchived: 1 });
activitySchema.index({ severity: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ tags: 1 });

// Text search index
activitySchema.index({
  description: 'text',
  action: 'text',
  entityName: 'text',
  userName: 'text'
});

// Pre-save middleware to generate activityId
activitySchema.pre('save', async function(next) {
  if (this.isNew && !this.activityId) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.activityId = `ACT-${year}${month}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Static method for logging activities
activitySchema.statics.logActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    
    // Broadcast to WebSocket clients
    const activityWebSocket = require('../services/activityWebSocket');
    activityWebSocket.broadcastActivity(activity);
    
    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
};

// Static method for getting activity statistics
activitySchema.statics.getActivityStats = async function(timeframe = '24h') {
  const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : timeframe === '30d' ? 720 : 24;
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: { $sum: { $cond: ['$isSuccessful', 1, 0] } },
        errors: { $sum: { $cond: ['$isSuccessful', 0, 1] } },
        byType: {
          $push: {
            type: '$type',
            operation: '$operation',
            severity: '$severity'
          }
        }
      }
    },
    {
      $addFields: {
        successRate: {
          $multiply: [
            { $divide: ['$successful', '$total'] },
            100
          ]
        }
      }
    }
  ]);
};

// Static method for archiving old activities
activitySchema.statics.archiveExpiredActivities = async function(daysOld = 90) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  const result = await this.updateMany(
    {
      createdAt: { $lt: cutoffDate },
      isArchived: false,
      severity: { $in: ['low', 'medium'] }
    },
    {
      $set: { isArchived: true }
    }
  );

  return result.modifiedCount;
};

// Static method for bulk operations
activitySchema.statics.bulkUpdate = async function(activityIds, updateData) {
  return this.updateMany(
    { _id: { $in: activityIds } },
    { $set: updateData }
  );
};

// Instance method for getting related activities
activitySchema.methods.getRelatedActivities = async function(limit = 5) {
  return this.constructor.find({
    $or: [
      { entityId: this.entityId },
      { clientId: this.clientId },
      { agentId: this.agentId }
    ],
    _id: { $ne: this._id },
    isArchived: false
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Activity', activitySchema);
