
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');

// Generate JWT Token
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role?.name || user.role,
    branch: user.branch,
    permissions: user.role?.permissions || [],
    flatPermissions: user.flatPermissions || []
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Login Controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Find user with populated role and select password
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('role')
      .select('+password');

    if (!user) {
      console.log('User not found:', email);
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User account deactivated:', email);
      return errorResponse(res, 'Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    console.log('Login successful for:', email);

    return successResponse(res, {
      token,
      user: userResponse
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Get authenticated user
const getAuthenticatedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Logout controller
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// Refresh session
const refreshSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const token = generateToken(user);

    return successResponse(res, {
      token,
      user: user.toJSON()
    }, 'Session refreshed successfully');
  } catch (error) {
    next(error);
  }
};

// Refresh permissions
const refreshPermissions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const token = generateToken(user);

    return successResponse(res, {
      token,
      permissions: user.role?.permissions || [],
      flatPermissions: user.flatPermissions || []
    }, 'Permissions refreshed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getAuthenticatedUser,
  refreshSession,
  refreshPermissions
};
