const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.hasPermission('clients', 'view')) {
      return errorResponse(res, 'Access denied', 403);
    }
    const clients = [{ id: '1', name: 'Sample Client', email: 'client@example.com' }];
    return successResponse(res, clients, 'Clients retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve clients', 500);
  }
});

module.exports = router;