const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/test', authMiddleware, async (req, res) => {
  try {
    return successResponse(res, { message: 'Developer API working', user: req.user.name }, 'Test successful');
  } catch (error) {
    return errorResponse(res, 'Test failed', 500);
  }
});

module.exports = router;