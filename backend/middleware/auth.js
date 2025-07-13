
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

const authMiddleware = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 3) Find user and populate role
    const currentUser = await User.findById(decoded.userId)
      .populate('role')
      .select('-password');
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add permission checking methods to user
    currentUser.hasPermission = function(module, action) {
      if (!this.role || !this.role.permissions) return false;
      if (this.role.name === 'super_admin') return true;
      
      const modulePermissions = this.role.permissions.find(p => p.module === module);
      return modulePermissions ? modulePermissions.actions.includes(action) : false;
    };

    // Attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again!'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your token has expired! Please log in again.'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;
