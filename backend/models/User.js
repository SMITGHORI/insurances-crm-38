
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['main', 'north', 'south', 'east', 'west'],
    default: 'main'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  phone: {
    type: String,
    trim: true
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
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });

// Virtual for flattened permissions
UserSchema.virtual('flatPermissions').get(function() {
  if (!this.role || !this.role.permissions) return [];
  
  return this.role.permissions.flatMap(p => 
    p.actions.map(action => `${p.module}:${action}`)
  );
});

// Pre-find hook to populate role
UserSchema.pre(/^find/, function(next) {
  if (!this.getOptions().skipPopulate) {
    this.populate({
      path: 'role',
      select: 'name displayName permissions'
    });
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON output
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
