
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authMiddleware);

// Mock data for now - replace with actual database models
let offers = [];
let broadcasts = [];

/**
 * @route   GET /api/offers
 * @desc    Get all offers
 * @access  Private
 */
router.get('/', requirePermission('offers', 'view'), (req, res) => {
  try {
    res.json({
      success: true,
      data: offers,
      message: 'Offers retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving offers'
    });
  }
});

/**
 * @route   POST /api/offers
 * @desc    Create new offer
 * @access  Private
 */
router.post('/', requirePermission('offers', 'create'), (req, res) => {
  try {
    const newOffer = {
      id: Date.now().toString(),
      ...req.body,
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    offers.push(newOffer);
    
    res.status(201).json({
      success: true,
      data: newOffer,
      message: 'Offer created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating offer'
    });
  }
});

/**
 * @route   PUT /api/offers/:id
 * @desc    Update offer
 * @access  Private
 */
router.put('/:id', requirePermission('offers', 'edit'), (req, res) => {
  try {
    const offerIndex = offers.findIndex(o => o.id === req.params.id);
    if (offerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    offers[offerIndex] = {
      ...offers[offerIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: offers[offerIndex],
      message: 'Offer updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating offer'
    });
  }
});

/**
 * @route   DELETE /api/offers/:id
 * @desc    Delete offer
 * @access  Private
 */
router.delete('/:id', requirePermission('offers', 'delete'), (req, res) => {
  try {
    const offerIndex = offers.findIndex(o => o.id === req.params.id);
    if (offerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    offers.splice(offerIndex, 1);
    
    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting offer'
    });
  }
});

/**
 * @route   GET /api/offers/broadcasts
 * @desc    Get all broadcasts
 * @access  Private
 */
router.get('/broadcasts', requirePermission('offers', 'view'), (req, res) => {
  try {
    res.json({
      success: true,
      data: broadcasts,
      message: 'Broadcasts retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving broadcasts'
    });
  }
});

/**
 * @route   POST /api/offers/broadcasts
 * @desc    Create new broadcast
 * @access  Private
 */
router.post('/broadcasts', requirePermission('offers', 'create'), (req, res) => {
  try {
    const newBroadcast = {
      id: Date.now().toString(),
      ...req.body,
      createdBy: req.user._id,
      createdAt: new Date(),
      status: 'sent'
    };
    
    broadcasts.push(newBroadcast);
    
    res.status(201).json({
      success: true,
      data: newBroadcast,
      message: 'Broadcast sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending broadcast'
    });
  }
});

module.exports = router;
