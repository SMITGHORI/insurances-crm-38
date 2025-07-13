
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');

// Import controllers
const {
  login,
  logout,
  getAuthenticatedUser,
  refreshSession,
  refreshPermissions
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear session
 * @access  Private
 */
router.post('/logout',
  authMiddleware,
  logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me',
  authMiddleware,
  getAuthenticatedUser
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh user session
 * @access  Private
 */
router.post('/refresh',
  authMiddleware,
  refreshSession
);

/**
 * @route   GET /api/auth/refresh-permissions
 * @desc    Refresh user permissions and return new token
 * @access  Private
 */
router.get('/refresh-permissions',
  authMiddleware,
  refreshPermissions
);

module.exports = router;
