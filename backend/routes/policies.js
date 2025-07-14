const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.hasPermission('policies', 'view')) {
      return errorResponse(res, 'Access denied', 403);
    }
    const policies = [{ id: '1', policyNumber: 'POL-001', clientName: 'Sample Client' }];
    return successResponse(res, policies, 'Policies retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve policies', 500);
  }
});

module.exports = router;