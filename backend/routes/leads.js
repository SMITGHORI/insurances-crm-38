
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authMiddleware);

// Mock data for now - replace with actual database models
let leads = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    status: 'new',
    source: 'website',
    branch: 'main',
    assignedAgentId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * @route   GET /api/leads
 * @desc    Get all leads
 * @access  Private
 */
router.get('/', requirePermission('leads', 'view'), (req, res) => {
  try {
    let filteredLeads = leads;
    
    // Filter by agent if user is an agent
    if (req.user.role.name === 'agent') {
      filteredLeads = leads.filter(lead => 
        lead.assignedAgentId === req.user._id.toString() || 
        lead.branch === req.user.branch
      );
    }
    
    res.json({
      success: true,
      data: filteredLeads,
      total: filteredLeads.length,
      message: 'Leads retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving leads'
    });
  }
});

/**
 * @route   POST /api/leads
 * @desc    Create new lead
 * @access  Private
 */
router.post('/', requirePermission('leads', 'create'), (req, res) => {
  try {
    const newLead = {
      id: Date.now().toString(),
      ...req.body,
      createdBy: req.user._id,
      branch: req.user.branch,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    leads.push(newLead);
    
    res.status(201).json({
      success: true,
      data: newLead,
      message: 'Lead created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating lead'
    });
  }
});

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead
 * @access  Private
 */
router.put('/:id', requirePermission('leads', 'edit'), (req, res) => {
  try {
    const leadIndex = leads.findIndex(l => l.id === req.params.id);
    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Check if agent can edit this lead
    if (req.user.role.name === 'agent') {
      const lead = leads[leadIndex];
      if (lead.assignedAgentId !== req.user._id.toString() && lead.branch !== req.user.branch) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit leads assigned to you'
        });
      }
    }
    
    leads[leadIndex] = {
      ...leads[leadIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: leads[leadIndex],
      message: 'Lead updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lead'
    });
  }
});

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete lead
 * @access  Private
 */
router.delete('/:id', requirePermission('leads', 'delete'), (req, res) => {
  try {
    const leadIndex = leads.findIndex(l => l.id === req.params.id);
    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    leads.splice(leadIndex, 1);
    
    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lead'
    });
  }
});

module.exports = router;
