
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
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Check for fallback users first
    if (userId === 'admin-fallback-id' || userId === 'agent-fallback-id') {
      // For fallback users, use the data from the token directly
      req.user = {
        _id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        branch: decoded.branch,
        isActive: true,
        flatPermissions: decoded.flatPermissions || []
      };
      return next();
    }

    // Find user in database
    const currentUser = await User.findById(userId).populate('role');
    
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

    // Attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    return next(error);
  }
};

module.exports = authMiddleware;
