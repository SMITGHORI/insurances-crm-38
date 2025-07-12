
const Lead = require('../models/Lead');
const { AppError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseHandler');

/**
 * Get all leads with filtering and pagination
 */
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') filter.status = status;
    if (source && source !== 'all') filter.source = source;
    if (priority && priority !== 'all') filter.priority = priority;
    if (assignedTo && assignedTo !== 'all') filter['assignedTo.agentId'] = assignedTo;

    // Add search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [leads, totalCount] = await Promise.all([
      Lead.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('assignedTo.agentId', 'name email')
        .lean(),
      Lead.countDocuments(filter)
    ]);

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalItems: totalCount,
      itemsPerPage: limitNum,
      hasNext: pageNum < Math.ceil(totalCount / limitNum),
      hasPrev: pageNum > 1
    };

    successResponse(res, {
      leads,
      pagination,
      totalCount
    }, 'Leads retrieved successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Get single lead by ID
 */
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create new lead
 */
const createLead = async (req, res, next) => {
  try {
    const leadData = {
      ...req.body,
      assignedTo: {
        agentId: req.body.assignedTo?.agentId || req.user._id,
        name: req.body.assignedTo?.name || req.user.name
      }
    };

    const lead = new Lead(leadData);
    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, populatedLead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update lead
 */
const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    // Update lead
    Object.assign(lead, updateData);
    lead.lastInteraction = new Date();
    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete lead
 */
const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    await Lead.findByIdAndDelete(id);

    successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add follow-up to lead
 */
const addFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const followUpData = {
      ...req.body,
      createdBy: req.user.name,
      createdAt: new Date()
    };

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    lead.followUps.push(followUpData);
    lead.lastInteraction = new Date();
    
    // Update next follow-up if provided
    if (followUpData.nextFollowUp) {
      lead.nextFollowUp = new Date(followUpData.nextFollowUp);
    }

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Follow-up added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add note to lead
 */
const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const noteData = {
      ...req.body,
      createdBy: req.user.name,
      createdAt: new Date()
    };

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    lead.notes.push(noteData);
    lead.lastInteraction = new Date();
    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Note added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Assign lead to agent
 */
const assignLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId, agentName } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    lead.assignedTo = { agentId, name: agentName };
    lead.lastInteraction = new Date();
    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Lead assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Convert lead to client
 */
const convertToClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo.agentId?.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    // Update lead status
    lead.status = 'Converted';
    lead.lastInteraction = new Date();
    await lead.save();

    // Here you would typically create a Client record
    // const Client = require('../models/Client');
    // const clientData = {
    //   name: lead.name,
    //   email: lead.email,
    //   phone: lead.phone,
    //   address: lead.address,
    //   sourceLeadId: lead._id,
    //   assignedTo: lead.assignedTo
    // };
    // const client = new Client(clientData);
    // await client.save();
    // lead.convertedToClientId = client._id;
    // await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, updatedLead, 'Lead converted to client successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get leads statistics
 */
const getLeadsStats = async (req, res, next) => {
  try {
    const { period = 'month', agentId } = req.query;

    // Build base filter
    const baseFilter = {};
    if (req.user.role === 'agent') {
      baseFilter['assignedTo.agentId'] = req.user._id;
    } else if (agentId) {
      baseFilter['assignedTo.agentId'] = agentId;
    }

    // Date range filter
    const now = new Date();
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const dateFilter = { ...baseFilter, createdAt: { $gte: startDate } };

    // Get various statistics
    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      lostLeads,
      statusStats,
      sourceStats,
      priorityStats
    ] = await Promise.all([
      Lead.countDocuments(baseFilter),
      Lead.countDocuments({ ...dateFilter, status: 'New' }),
      Lead.countDocuments({ ...dateFilter, status: 'Qualified' }),
      Lead.countDocuments({ ...dateFilter, status: 'Converted' }),
      Lead.countDocuments({ ...dateFilter, status: 'Lost' }),
      Lead.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      overview: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        convertedLeads,
        lostLeads,
        conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0
      },
      breakdown: {
        byStatus: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bySource: sourceStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: priorityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    };

    successResponse(res, stats, 'Lead statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Search leads
 */
const searchLeads = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    if (!query || query.length < 2) {
      throw new AppError('Search query must be at least 2 characters long', 400);
    }

    const filter = { $text: { $search: query } };
    
    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    const leads = await Lead.find(filter)
      .limit(parseInt(limit))
      .populate('assignedTo.agentId', 'name email')
      .lean();

    successResponse(res, leads, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get stale leads
 */
const getStaleLeads = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - parseInt(days));

    const filter = {
      $or: [
        { lastInteraction: { $lte: staleDate } },
        { lastInteraction: { $exists: false }, createdAt: { $lte: staleDate } }
      ],
      status: { $in: ['New', 'In Progress', 'Qualified'] }
    };

    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    const staleLeads = await Lead.find(filter)
      .populate('assignedTo.agentId', 'name email')
      .sort({ lastInteraction: 1 })
      .lean();

    successResponse(res, staleLeads, 'Stale leads retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get lead funnel report
 */
const getLeadFunnelReport = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Build base filter
    const baseFilter = {};
    if (req.user.role === 'agent') {
      baseFilter['assignedTo.agentId'] = req.user._id;
    }

    // Get funnel data
    const funnelData = await Lead.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDaysInStage: {
            $avg: {
              $dateDiff: {
                startDate: '$createdAt',
                endDate: '$updatedAt',
                unit: 'day'
              }
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const report = {
      stages: funnelData.map(stage => ({
        name: stage._id,
        count: stage.count,
        avgDaysInStage: Math.round(stage.avgDaysInStage || 0)
      })),
      totalLeads: funnelData.reduce((sum, stage) => sum + stage.count, 0)
    };

    successResponse(res, report, 'Lead funnel report retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update leads
 */
const bulkUpdateLeads = async (req, res, next) => {
  try {
    const { leadIds, updateData } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      throw new AppError('Lead IDs are required', 400);
    }

    // For agents, ensure they can only update their assigned leads
    let filter = { _id: { $in: leadIds } };
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    const result = await Lead.updateMany(
      filter,
      {
        ...updateData,
        lastInteraction: new Date()
      }
    );

    successResponse(res, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      successful: result.modifiedCount
    }, 'Leads updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Export leads
 */
const exportLeads = async (req, res, next) => {
  try {
    const { format = 'csv', filters = {} } = req.body;

    // Build filter
    const filter = {};
    if (filters.status && filters.status !== 'all') filter.status = filters.status;
    if (filters.source && filters.source !== 'all') filter.source = filters.source;
    if (filters.priority && filters.priority !== 'all') filter.priority = filters.priority;

    // Apply role-based filtering
    if (req.user.role === 'agent') {
      filter['assignedTo.agentId'] = req.user._id;
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo.agentId', 'name email')
      .lean();

    // Here you would implement actual export logic
    // For now, we'll return the data structure

    const exportData = {
      format,
      count: leads.length,
      data: leads,
      timestamp: new Date().toISOString(),
      // In a real implementation, you'd generate a file and return a download URL
      downloadUrl: `/api/exports/leads-${Date.now()}.${format}`
    };

    successResponse(res, exportData, 'Leads exported successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addFollowUp,
  addNote,
  assignLead,
  convertToClient,
  getLeadsStats,
  searchLeads,
  getStaleLeads,
  getLeadFunnelReport,
  bulkUpdateLeads,
  exportLeads
};
