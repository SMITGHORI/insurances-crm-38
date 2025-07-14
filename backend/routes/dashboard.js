
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    // Mock dashboard data - replace with actual database queries
    const stats = {
      totalClients: 150,
      totalPolicies: 89,
      totalClaims: 23,
      totalRevenue: 450000,
      recentActivities: [
        {
          id: 1,
          type: 'client_added',
          message: 'New client John Doe added',
          timestamp: new Date(),
          user: req.user.name
        },
        {
          id: 2,
          type: 'policy_created',
          message: 'Policy POL-2024-001 created',
          timestamp: new Date(),
          user: req.user.name
        }
      ]
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard stats'
    });
  }
});

module.exports = router;
