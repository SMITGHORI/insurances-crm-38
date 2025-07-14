const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const activities = [{ id: '1', type: 'login', description: 'User logged in', timestamp: new Date() }];
    return successResponse(res, activities, 'Activities retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve activities', 500);
  }
});

module.exports = router;