
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const Client = require('../models/Client');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get all claims with advanced filtering and pagination
 */
const getAllClaims = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      claimType,
      priority,
      assignedTo,
      clientId,
      policyId,
      minAmount,
      maxAmount,
      dateFrom,
      dateTo,
      sortField = 'createdAt',
      sortDirection = 'desc'
    } = req.query;

    // Build filter conditions
    const filterConditions = { isDeleted: { $ne: true } };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filterConditions.assignedTo = req.user._id;
    }

    // Apply filters
    if (search) {
      filterConditions.$text = { $search: search };
    }

    if (status && status !== 'all') {
      filterConditions.status = status;
    }

    if (claimType && claimType !== 'all') {
      filterConditions.claimType = claimType;
    }

    if (priority) {
      filterConditions.priority = priority;
    }

    if (assignedTo) {
      filterConditions.assignedTo = assignedTo;
    }

    if (clientId) {
      filterConditions.clientId = clientId;
    }

    if (policyId) {
      filterConditions.policyId = policyId;
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filterConditions.claimAmount = {};
      if (minAmount) filterConditions.claimAmount.$gte = parseFloat(minAmount);
      if (maxAmount) filterConditions.claimAmount.$lte = parseFloat(maxAmount);
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filterConditions.reportedDate = {};
      if (dateFrom) filterConditions.reportedDate.$gte = new Date(dateFrom);
      if (dateTo) filterConditions.reportedDate.$lte = new Date(dateTo);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortField] = sortDirection === 'desc' ? -1 : 1;

    // Execute query
    const [claims, totalClaims] = await Promise.all([
      Claim.find(filterConditions)
        .populate('clientId', 'firstName lastName email phone')
        .populate('policyId', 'policyNumber policyType coverage')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Claim.countDocuments(filterConditions)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalClaims / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: claims,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalClaims,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get a single claim by ID
 */
const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID format',
        timestamp: new Date().toISOString()
      });
    }

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('clientId', 'firstName lastName email phone address')
      .populate('policyId', 'policyNumber policyType coverage premium deductible')
      .populate('assignedTo', 'firstName lastName email department')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('notes.createdBy', 'firstName lastName')
      .populate('timeline.createdBy', 'firstName lastName')
      .lean();

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    // Role-based access control
    if (req.user.role === 'agent' && claim.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your assigned claims.',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: claim,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create a new claim
 */
const createClaim = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const claimData = req.body;
    claimData.createdBy = req.user._id;

    // Verify client and policy exist
    const [client, policy] = await Promise.all([
      Client.findById(claimData.clientId),
      Policy.findById(claimData.policyId)
    ]);

    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Client not found',
        timestamp: new Date().toISOString()
      });
    }

    if (!policy) {
      return res.status(400).json({
        success: false,
        message: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    // Verify policy belongs to client
    if (policy.clientId.toString() !== claimData.clientId) {
      return res.status(400).json({
        success: false,
        message: 'Policy does not belong to the selected client',
        timestamp: new Date().toISOString()
      });
    }

    // Check if claim amount exceeds policy coverage
    if (claimData.claimAmount > policy.coverage.totalCoverage) {
      return res.status(400).json({
        success: false,
        message: 'Claim amount exceeds policy coverage limit',
        timestamp: new Date().toISOString()
      });
    }

    // Create the claim
    const claim = new Claim(claimData);
    await claim.save();

    // Populate the created claim
    const populatedClaim = await Claim.findById(claim._id)
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Claim created successfully',
      data: populatedClaim,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create claim',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Update an existing claim
 */
const updateClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID format',
        timestamp: new Date().toISOString()
      });
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    // Role-based access control
    if (req.user.role === 'agent' && claim.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your assigned claims.',
        timestamp: new Date().toISOString()
      });
    }

    updateData.updatedBy = req.user._id;

    // Update the claim
    const updatedClaim = await Claim.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Claim updated successfully',
      data: updatedClaim,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Delete a claim (soft delete)
 */
const deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim ID format',
        timestamp: new Date().toISOString()
      });
    }

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete the claim
    await claim.softDelete(req.user._id);

    res.json({
      success: true,
      message: 'Claim deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete claim',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Update claim status
 */
const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, approvedAmount } = req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update status
    claim.status = status;
    if (approvedAmount !== undefined) {
      claim.approvedAmount = approvedAmount;
    }
    claim.updatedBy = req.user._id;

    // Add timeline event
    await claim.addTimelineEvent(
      `Status changed to ${status}`,
      reason || `Claim status updated to ${status}`,
      status.toLowerCase().replace(' ', '_'),
      req.user._id
    );

    const updatedClaim = await Claim.findById(id)
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Claim status updated successfully',
      data: updatedClaim,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update claim status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Add note to claim
 */
const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type, priority } = req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    // Add note
    await claim.addNote(content, type, priority, req.user._id);

    res.json({
      success: true,
      message: 'Note added successfully',
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

/**
 * Get claim notes
 */
const getClaimNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('notes.createdBy', 'firstName lastName')
      .select('notes');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: claim.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching claim notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim notes',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Upload claim document
 */
const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, name } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        timestamp: new Date().toISOString()
      });
    }

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    // Create document object
    const document = {
      name: name || req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      documentType,
      filePath: req.file.path,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    claim.documents.push(document);
    await claim.save();

    // Add timeline event
    await claim.addTimelineEvent(
      'Document uploaded',
      `Document "${document.name}" uploaded`,
      'document_uploaded',
      req.user._id
    );

    res.json({
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
 * Get claim documents
 */
const getClaimDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('documents.uploadedBy', 'firstName lastName')
      .select('documents');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: claim.documents.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching claim documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim documents',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Delete claim document
 */
const deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    const claim = await Claim.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
        timestamp: new Date().toISOString()
      });
    }

    const documentIndex = claim.documents.findIndex(doc => doc._id.toString() === documentId);

    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        timestamp: new Date().toISOString()
      });
    }

    const document = claim.documents[documentIndex];

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      console.warn('File not found on filesystem:', document.filePath);
    }

    // Remove document from array
    claim.documents.splice(documentIndex, 1);
    await claim.save();

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
 * Search claims
 */
const searchClaims = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long',
        timestamp: new Date().toISOString()
      });
    }

    const searchConditions = {
      isDeleted: { $ne: true },
      $or: [
        { claimNumber: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { 'contactDetails.primaryContact': new RegExp(query, 'i') }
      ]
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      searchConditions.assignedTo = req.user._id;
    }

    const claims = await Claim.find(searchConditions)
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName email')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: claims,
      count: claims.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error searching claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search claims',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get claims statistics
 */
const getClaimsStats = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        reportedDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      switch (period) {
        case 'day':
          dateFilter = {
            reportedDate: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          };
          break;
        case 'week':
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          dateFilter = { reportedDate: { $gte: weekStart } };
          break;
        case 'month':
          dateFilter = {
            reportedDate: {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1)
            }
          };
          break;
        case 'year':
          dateFilter = {
            reportedDate: {
              $gte: new Date(now.getFullYear(), 0, 1)
            }
          };
          break;
      }
    }

    const baseFilter = { isDeleted: { $ne: true }, ...dateFilter };

    // Role-based filtering
    if (req.user.role === 'agent') {
      baseFilter.assignedTo = req.user._id;
    }

    const [
      totalClaims,
      statusStats,
      typeStats,
      priorityStats,
      amountStats
    ] = await Promise.all([
      Claim.countDocuments(baseFilter),
      Claim.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Claim.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$claimType', count: { $sum: 1 } } }
      ]),
      Claim.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Claim.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$claimAmount' },
            totalApproved: { $sum: '$approvedAmount' },
            avgAmount: { $avg: '$claimAmount' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalClaims,
        statusStats,
        typeStats,
        priorityStats,
        amountStats: amountStats[0] || { totalAmount: 0, totalApproved: 0, avgAmount: 0 }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching claims stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims statistics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const baseFilter = { isDeleted: { $ne: true } };

    // Role-based filtering
    if (req.user.role === 'agent') {
      baseFilter.assignedTo = req.user._id;
    }

    const [
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      recentClaims
    ] = await Promise.all([
      Claim.countDocuments(baseFilter),
      Claim.countDocuments({ ...baseFilter, status: { $in: ['Reported', 'Under Review', 'Pending'] } }),
      Claim.countDocuments({ ...baseFilter, status: 'Approved' }),
      Claim.countDocuments({ ...baseFilter, status: 'Rejected' }),
      Claim.find(baseFilter)
        .populate('clientId', 'firstName lastName')
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('claimNumber status claimAmount reportedDate')
    ]);

    res.json({
      success: true,
      data: {
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        recentClaims
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Bulk update claims
 */
const bulkUpdateClaims = async (req, res) => {
  try {
    const { claimIds, updateData } = req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    updateData.updatedBy = req.user._id;

    const result = await Claim.updateMany(
      { _id: { $in: claimIds }, isDeleted: { $ne: true } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} claims updated successfully`,
      data: { modifiedCount: result.modifiedCount },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error bulk updating claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update claims',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Bulk assign claims
 */
const bulkAssignClaims = async (req, res) => {
  try {
    const { claimIds, agentId } = req.body;

    // Verify agent exists
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(400).json({
        success: false,
        message: 'Agent not found',
        timestamp: new Date().toISOString()
      });
    }

    const result = await Claim.updateMany(
      { _id: { $in: claimIds }, isDeleted: { $ne: true } },
      {
        assignedTo: agentId,
        updatedBy: req.user._id
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} claims assigned successfully`,
      data: { modifiedCount: result.modifiedCount },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error bulk assigning claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk assign claims',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Export claims
 */
const exportClaims = async (req, res) => {
  try {
    const filterConditions = { isDeleted: { $ne: true } };

    // Apply filters from query params
    Object.keys(req.query).forEach(key => {
      if (req.query[key] && req.query[key] !== 'all') {
        if (key === 'status' || key === 'claimType' || key === 'priority') {
          filterConditions[key] = req.query[key];
        }
      }
    });

    // Role-based filtering
    if (req.user.role === 'agent') {
      filterConditions.assignedTo = req.user._id;
    }

    const claims = await Claim.find(filterConditions)
      .populate('clientId', 'firstName lastName email')
      .populate('policyId', 'policyNumber policyType')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Format data for export
    const exportData = claims.map(claim => ({
      'Claim Number': claim.claimNumber,
      'Client Name': `${claim.clientId.firstName} ${claim.clientId.lastName}`,
      'Policy Number': claim.policyId.policyNumber,
      'Claim Type': claim.claimType,
      'Status': claim.status,
      'Priority': claim.priority,
      'Claim Amount': claim.claimAmount,
      'Approved Amount': claim.approvedAmount || 0,
      'Incident Date': claim.incidentDate.toISOString().split('T')[0],
      'Reported Date': claim.reportedDate.toISOString().split('T')[0],
      'Assigned To': `${claim.assignedTo.firstName} ${claim.assignedTo.lastName}`,
      'Description': claim.description
    }));

    res.json({
      success: true,
      data: exportData,
      count: exportData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error exporting claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export claims',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get policies for claim form
 */
const getPoliciesForClaim = async (req, res) => {
  try {
    const policies = await Policy.find({ status: 'Active' })
      .populate('clientId', 'firstName lastName')
      .select('policyNumber policyType coverage clientId')
      .sort({ policyNumber: 1 });

    res.json({
      success: true,
      data: policies,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching policies for claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policies',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get clients for claim form
 */
const getClientsForClaim = async (req, res) => {
  try {
    const clients = await Client.find({ status: 'Active' })
      .select('firstName lastName email phone')
      .sort({ lastName: 1, firstName: 1 });

    res.json({
      success: true,
      data: clients,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching clients for claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get policy details for claim
 */
const getPolicyDetails = async (req, res) => {
  try {
    const { policyId } = req.params;

    const policy = await Policy.findById(policyId)
      .populate('clientId', 'firstName lastName email');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: policy,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching policy details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch policy details',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get claims aging report
 */
const getClaimsAgingReport = async (req, res) => {
  try {
    const now = new Date();
    
    const agingReport = await Claim.aggregate([
      { $match: { isDeleted: { $ne: true }, status: { $in: ['Reported', 'Under Review', 'Pending'] } } },
      {
        $addFields: {
          ageInDays: {
            $divide: [
              { $subtract: [now, '$reportedDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$ageInDays',
          boundaries: [0, 7, 14, 30, 60, 90, Number.MAX_VALUE],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            totalAmount: { $sum: '$claimAmount' },
            claims: {
              $push: {
                _id: '$_id',
                claimNumber: '$claimNumber',
                claimAmount: '$claimAmount',
                reportedDate: '$reportedDate',
                ageInDays: { $floor: '$ageInDays' }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: agingReport,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching claims aging report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claims aging report',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get settlement report
 */
const getSettlementReport = async (req, res) => {
  try {
    const settlementReport = await Claim.aggregate([
      { $match: { isDeleted: { $ne: true }, status: { $in: ['Approved', 'Settled'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$reportedDate' },
            month: { $month: '$reportedDate' }
          },
          totalClaims: { $sum: 1 },
          totalClaimAmount: { $sum: '$claimAmount' },
          totalApprovedAmount: { $sum: '$approvedAmount' },
          avgClaimAmount: { $avg: '$claimAmount' },
          avgApprovedAmount: { $avg: '$approvedAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: settlementReport,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching settlement report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settlement report',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Import claims
 */
const importClaims = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        timestamp: new Date().toISOString()
      });
    }

    // This would typically parse CSV/Excel file and create claims
    // For now, return success message
    res.json({
      success: true,
      message: 'Claims import functionality will be implemented',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error importing claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import claims',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Download import template
 */
const downloadTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        'Client ID': 'required',
        'Policy ID': 'required',
        'Claim Type': 'Auto|Home|Life|Health|Travel|Business|Disability|Property|Liability',
        'Priority': 'Low|Medium|High|Urgent',
        'Claim Amount': 'number',
        'Deductible': 'number',
        'Incident Date': 'YYYY-MM-DD',
        'Description': 'text',
        'Assigned To': 'User ID'
      }
    ];

    res.json({
      success: true,
      data: templateData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download template',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getAllClaims,
  getClaimById,
  createClaim,
  updateClaim,
  deleteClaim,
  updateClaimStatus,
  addNote,
  getClaimNotes,
  uploadDocument,
  getClaimDocuments,
  deleteDocument,
  searchClaims,
  getClaimsStats,
  getDashboardStats,
  bulkUpdateClaims,
  bulkAssignClaims,
  exportClaims,
  getPoliciesForClaim,
  getClientsForClaim,
  getPolicyDetails,
  getClaimsAgingReport,
  getSettlementReport,
  importClaims,
  downloadTemplate
};
