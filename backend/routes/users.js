const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().populate('role').select('-password');
    return successResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve users', 500);
  }
});

module.exports = router;