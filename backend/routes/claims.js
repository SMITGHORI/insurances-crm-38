const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.hasPermission('claims', 'view')) {
      return errorResponse(res, 'Access denied', 403);
    }
    const claims = [{ id: '1', claimNumber: 'CLM-001', amount: 10000, status: 'pending' }];
    return successResponse(res, claims, 'Claims retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve claims', 500);
  }
});

module.exports = router;