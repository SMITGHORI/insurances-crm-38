const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const authMiddleware = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHandler');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const roles = await Role.find();
    return successResponse(res, roles, 'Roles retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve roles', 500);
  }
});

module.exports = router;