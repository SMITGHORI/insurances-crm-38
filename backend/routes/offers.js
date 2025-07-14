const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const offers = [{ id: '1', name: 'Sample Offer', description: 'Special discount', status: 'active' }];
    return successResponse(res, offers, 'Offers retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve offers', 500);
  }
});

module.exports = router;