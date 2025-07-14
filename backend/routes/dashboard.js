const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const dashboardData = { stats: { totalClients: 150, totalPolicies: 300 }, user: req.user };
    return successResponse(res, dashboardData, 'Dashboard data retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve dashboard data', 500);
  }
});

module.exports = router;