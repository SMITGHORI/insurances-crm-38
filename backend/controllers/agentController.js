
const Agent = require('../models/Agent');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { generateAgentId } = require('../utils/idGenerator');
const { calculatePerformanceMetrics } = require('../utils/performanceCalculator');
const { sendNotification } = require('../services/notificationService');
const { uploadFile, deleteFile } = require('../services/fileService');

/**
 * Get all agents with filtering, pagination, and search
 */
exports.getAllAgents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      specialization = '',
      region = '',
      teamId = '',
      sortField = 'createdAt',
      sortDirection = 'desc',
      hireDate,
      minCommission,
      maxCommission
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Add other filters
    if (specialization) filter.specialization = specialization;
    if (region) filter.region = region;
    if (teamId) filter.teamId = teamId;
    
    // Date filters
    if (hireDate) {
      filter.hireDate = { $gte: new Date(hireDate) };
    }

    // Commission filters
    if (minCommission || maxCommission) {
      filter.commissionRate = {};
      if (minCommission) filter.commissionRate.$gte = parseFloat(minCommission);
      if (maxCommission) filter.commissionRate.$lte = parseFloat(maxCommission);
    }

    // Role-based filtering
    if (req.user.role === 'manager') {
      filter.$or = [
        { managerId: req.user._id },
        { region: req.user.region }
      ];
    } else if (req.user.role === 'agent') {
      filter._id = req.user._id;
    }

    // Build sort object
    const sort = {};
    sort[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [agents, totalItems] = await Promise.all([
      Agent.find(filter)
        .populate('teamId', 'name region')
        .populate('managerId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Agent.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    const currentPage = parseInt(page);

    res.json({
      success: true,
      data: agents,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get agent by ID
 */
exports.getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id)
      .populate('teamId', 'name region')
      .populate('managerId', 'name email')
      .populate('documents.uploadedBy', 'name')
      .populate('notes.createdBy', 'name')
      .lean();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check permissions
    if (req.user.role === 'agent' && agent._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: agent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create new agent
 */
exports.createAgent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const agentData = req.body;
    
    // Generate unique agent ID
    agentData.agentId = await generateAgentId();
    
    // Create agent
    const agent = new Agent(agentData);
    await agent.save();

    // Create user account if email is provided
    if (agentData.email) {
      const userData = {
        name: agentData.name,
        email: agentData.email,
        role: agentData.role || 'agent',
        agentId: agent._id,
        isActive: agentData.status === 'active'
      };
      
      const user = new User(userData);
      await user.save();
      
      // Update agent with user reference
      agent.userId = user._id;
      await agent.save();
    }

    // Send notification
    await sendNotification({
      type: 'agent_created',
      title: 'New Agent Created',
      message: `Agent ${agent.name} has been created successfully`,
      recipients: ['super_admin', 'manager']
    });

    const populatedAgent = await Agent.findById(agent._id)
      .populate('teamId', 'name region')
      .populate('managerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: populatedAgent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create agent',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Update agent
 */
exports.updateAgent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.agentId;
    delete updateData.createdAt;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update agent
    Object.assign(agent, updateData);
    agent.updatedAt = new Date();
    await agent.save();

    // Update associated user account
    if (agent.userId) {
      await User.findByIdAndUpdate(agent.userId, {
        name: agent.name,
        email: agent.email,
        isActive: agent.status === 'active'
      });
    }

    const updatedAgent = await Agent.findById(id)
      .populate('teamId', 'name region')
      .populate('managerId', 'name email');

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: updatedAgent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update agent',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Delete agent (soft delete)
 */
exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete
    agent.status = 'terminated';
    agent.terminationDate = new Date();
    agent.isDeleted = true;
    await agent.save();

    // Deactivate user account
    if (agent.userId) {
      await User.findByIdAndUpdate(agent.userId, {
        isActive: false,
        deletedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete agent',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Upload agent document
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, name } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        timestamp: new Date().toISOString()
      });
    }

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    // Upload file
    const fileUrl = await uploadFile(file, 'agents');

    // Add document to agent
    const document = {
      name: name || file.originalname,
      type: documentType,
      url: fileUrl,
      size: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    agent.documents.push(document);
    await agent.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get agent documents
 */
exports.getAgentDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id)
      .select('documents')
      .populate('documents.uploadedBy', 'name');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: agent.documents,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agent documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent documents',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Delete agent document
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    const document = agent.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        timestamp: new Date().toISOString()
      });
    }

    // Delete file from storage
    await deleteFile(document.url);

    // Remove document from agent
    agent.documents.pull(documentId);
    await agent.save();

    res.json({
      success: true,
      message: 'Document deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get agent clients
 */
exports.getAgentClients = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = '' } = req.query;

    const Client = require('../models/Client');
    
    const filter = { agentId: id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [clients, totalItems] = await Promise.all([
      Client.find(filter)
        .select('name email phone status totalPolicies totalPremium')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Client.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        itemsPerPage: parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agent clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent clients',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get agent policies
 */
exports.getAgentPolicies = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = '' } = req.query;

    const Policy = require('../models/Policy');
    
    const filter = { agentId: id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [policies, totalItems] = await Promise.all([
      Policy.find(filter)
        .populate('clientId', 'name email')
        .select('policyNumber type status premium startDate endDate')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Policy.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: policies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        itemsPerPage: parseInt(limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agent policies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent policies',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get agent commissions
 */
exports.getAgentCommissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, status = '' } = req.query;

    const Commission = require('../models/Commission');
    
    const filter = { agentId: id };
    
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const commissions = await Commission.find(filter)
      .populate('policyId', 'policyNumber type premium')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate totals
    const totalCommissions = commissions.reduce((sum, comm) => sum + comm.amount, 0);
    const paidCommissions = commissions
      .filter(comm => comm.status === 'paid')
      .reduce((sum, comm) => sum + comm.amount, 0);
    const pendingCommissions = commissions
      .filter(comm => comm.status === 'pending')
      .reduce((sum, comm) => sum + comm.amount, 0);

    res.json({
      success: true,
      data: {
        totalCommissions,
        paidCommissions,
        pendingCommissions,
        commissionHistory: commissions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agent commissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent commissions',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get agent performance
 */
exports.getAgentPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'month', year = new Date().getFullYear() } = req.query;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    // Calculate performance metrics
    const performance = await calculatePerformanceMetrics(id, period, year);

    res.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent performance',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Additional controller methods for remaining endpoints...
exports.updatePerformanceTargets = async (req, res) => {
  // Implementation for updating performance targets
  try {
    const { id } = req.params;
    const targetsData = req.body;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    agent.performanceTargets = targetsData;
    await agent.save();

    res.json({
      success: true,
      message: 'Performance targets updated successfully',
      data: agent.performanceTargets,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating performance targets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update performance targets',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isPrivate = false, tags = [] } = req.body;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    const note = {
      content,
      createdBy: req.user._id,
      createdAt: new Date(),
      isPrivate,
      tags
    };

    agent.notes.push(note);
    await agent.save();

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: note,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getAgentNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id)
      .select('notes')
      .populate('notes.createdBy', 'name');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: agent.notes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agent notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent notes',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.searchAgents = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const agents = await Agent.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { licenseNumber: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    })
    .select('name email phone specialization region')
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: agents,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error searching agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search agents',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getAgentStats = async (req, res) => {
  try {
    const totalAgents = await Agent.countDocuments();
    const activeAgents = await Agent.countDocuments({ status: 'active' });
    const inactiveAgents = await Agent.countDocuments({ status: 'inactive' });
    const onboardingAgents = await Agent.countDocuments({ status: 'onboarding' });

    const avgCommissionRate = await Agent.aggregate([
      { $group: { _id: null, avgRate: { $avg: '$commissionRate' } } }
    ]);

    const specializationStats = await Agent.aggregate([
      { $group: { _id: '$specialization', count: { $sum: 1 } } }
    ]);

    const regionStats = await Agent.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalAgents,
        activeAgents,
        inactiveAgents,
        onboardingAgents,
        avgCommissionRate: avgCommissionRate[0]?.avgRate || 0,
        bySpecialization: specializationStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byRegion: regionStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent statistics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getPerformanceRankings = async (req, res) => {
  try {
    const { period = 'month', metric = 'totalPremium' } = req.query;

    // Implementation for performance rankings
    const agents = await Agent.find({ status: 'active' })
      .select('name totalPremium conversionRate')
      .sort({ [metric]: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: agents,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching performance rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance rankings',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.getExpiringLicenses = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    const agents = await Agent.find({
      licenseExpiry: { $lte: expiryDate },
      status: 'active'
    })
    .select('name email licenseNumber licenseExpiry')
    .sort({ licenseExpiry: 1 })
    .lean();

    res.json({
      success: true,
      data: agents,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching expiring licenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring licenses',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.bulkUpdateAgents = async (req, res) => {
  try {
    const { agentIds, updateData } = req.body;

    const result = await Agent.updateMany(
      { _id: { $in: agentIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: 'Agents updated successfully',
      data: { modifiedCount: result.modifiedCount },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error bulk updating agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update agents',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

exports.exportAgents = async (req, res) => {
  try {
    const agents = await Agent.find({})
      .populate('teamId', 'name')
      .populate('managerId', 'name')
      .lean();

    res.json({
      success: true,
      data: {
        totalRecords: agents.length,
        agents
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error exporting agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export agents',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
