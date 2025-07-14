const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const headerData = { user: req.user, notifications: [] };
    return successResponse(res, headerData, 'Header data retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve header data', 500);
  }
});

module.exports = router;