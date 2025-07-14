
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authMiddleware);

// Mock data for now
let quotations = [];

/**
 * @route   GET /api/quotations
 * @desc    Get all quotations
 * @access  Private
 */
router.get('/', requirePermission('quotations', 'view'), (req, res) => {
  try {
    let filteredQuotations = quotations;
    
    // Filter by agent if user is an agent
    if (req.user.role.name === 'agent') {
      filteredQuotations = quotations.filter(quote => 
        quote.assignedAgentId === req.user._id.toString() || 
        quote.branch === req.user.branch
      );
    }
    
    res.json({
      success: true,
      data: filteredQuotations,
      total: filteredQuotations.length,
      message: 'Quotations retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving quotations'
    });
  }
});

/**
 * @route   POST /api/quotations
 * @desc    Create new quotation
 * @access  Private
 */
router.post('/', requirePermission('quotations', 'create'), (req, res) => {
  try {
    const newQuotation = {
      id: Date.now().toString(),
      quotationNumber: `QT-${Date.now()}`,
      ...req.body,
      createdBy: req.user._id,
      branch: req.user.branch,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    quotations.push(newQuotation);
    
    res.status(201).json({
      success: true,
      data: newQuotation,
      message: 'Quotation created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating quotation'
    });
  }
});

/**
 * @route   PUT /api/quotations/:id
 * @desc    Update quotation
 * @access  Private
 */
router.put('/:id', requirePermission('quotations', 'edit'), (req, res) => {
  try {
    const quotationIndex = quotations.findIndex(q => q.id === req.params.id);
    if (quotationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    
    quotations[quotationIndex] = {
      ...quotations[quotationIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: quotations[quotationIndex],
      message: 'Quotation updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating quotation'
    });
  }
});

module.exports = router;
