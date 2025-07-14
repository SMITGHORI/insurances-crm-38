const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const leads = [{ id: '1', name: 'Sample Lead', email: 'lead@example.com', status: 'new' }];
    return successResponse(res, leads, 'Leads retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve leads', 500);
  }
});

module.exports = router;