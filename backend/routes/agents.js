const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const agents = await User.find().populate('role').select('-password');
    return successResponse(res, agents, 'Agents retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve agents', 500);
  }
});

module.exports = router;