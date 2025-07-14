const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const quotations = [{ id: '1', quotationNumber: 'QUO-001', clientName: 'Sample Client', status: 'pending' }];
    return successResponse(res, quotations, 'Quotations retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve quotations', 500);
  }
});

module.exports = router;