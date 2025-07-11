
const Client = require('../models/Client');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// Get all clients with pagination and filtering
const getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      sortField = 'createdAt',
      sortDirection = 'desc'
    } = req.query;

    // Build filter query
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.agentId = req.user.id;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { clientId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Type filtering
    if (type && type !== 'all') {
      filter.clientType = type;
    }

    // Status filtering
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortField] = sortDirection === 'asc' ? 1 : -1;

    // Execute query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      populate: [
        { path: 'agentId', select: 'name email' }
      ]
    };

    const result = await Client.paginate(filter, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.totalDocs,
        itemsPerPage: result.limit
      },
      total: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients',
      error: error.message
    });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format'
      });
    }

    let filter = { _id: id };

    // Role-based access control
    if (req.user.role === 'agent') {
      filter.agentId = req.user.id;
    }

    const client = await Client.findOne(filter)
      .populate('agentId', 'name email')
      .populate('notes.createdBy', 'name email');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client',
      error: error.message
    });
  }
};

// Create new client
const createClient = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const clientData = req.body;

    // Generate client ID
    const clientCount = await Client.countDocuments();
    clientData.clientId = `CL${String(clientCount + 1).padStart(6, '0')}`;

    // If no assigned agent specified, assign to current user if they're an agent
    if (!clientData.agentId && req.user.role === 'agent') {
      clientData.agentId = req.user.id;
    }

    // Create the client
    const client = new Client(clientData);
    await client.save();

    // Populate the created client
    await client.populate([
      { path: 'agentId', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    console.error('Error creating client:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create client',
      error: error.message
    });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let filter = { _id: id };

    // Role-based access control
    if (req.user.role === 'agent') {
      filter.agentId = req.user.id;
    }

    const client = await Client.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'agentId', select: 'name email' }
    ]);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Error updating client:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update client',
      error: error.message
    });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client ID format'
      });
    }

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
      error: error.message
    });
  }
};

// Search clients
const searchClients = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    let filter = {
      $or: [
        { clientId: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    };

    // Role-based filtering
    if (req.user.role === 'agent') {
      filter.agentId = req.user.id;
    }

    const clients = await Client.find(filter)
      .limit(parseInt(limit))
      .populate('agentId', 'name email');

    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search clients',
      error: error.message
    });
  }
};

// Get client statistics
const getClientStats = async (req, res) => {
  try {
    let matchFilter = {};
    
    // Role-based filtering
    if (req.user.role === 'agent') {
      matchFilter.agentId = new mongoose.Types.ObjectId(req.user.id);
    }

    const stats = await Client.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveClients: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          prospectiveClients: {
            $sum: { $cond: [{ $eq: ['$status', 'prospective'] }, 1, 0] }
          },
          totalPremium: { $sum: '$totalPremium' },
          totalPolicies: { $sum: '$totalPolicies' }
        }
      }
    ]);

    const result = stats[0] || {
      totalClients: 0,
      activeClients: 0,
      inactiveClients: 0,
      prospectiveClients: 0,
      totalPremium: 0,
      totalPolicies: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client statistics',
      error: error.message
    });
  }
};

// Get clients by agent
const getClientsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format'
      });
    }

    const clients = await Client.find({ agentId })
      .populate('agentId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients by agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients by agent',
      error: error.message
    });
  }
};

// Assign client to agent
const assignClientToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    const client = await Client.findByIdAndUpdate(
      id,
      { agentId },
      { new: true }
    ).populate('agentId', 'name email');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client assigned successfully',
      data: client
    });
  } catch (error) {
    console.error('Error assigning client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign client',
      error: error.message
    });
  }
};

// Bulk update clients
const bulkUpdateClients = async (req, res) => {
  try {
    const { clientIds, updateData } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client IDs array is required'
      });
    }

    const result = await Client.updateMany(
      { _id: { $in: clientIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} clients updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error bulk updating clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update clients',
      error: error.message
    });
  }
};

// Bulk delete clients
const bulkDeleteClients = async (req, res) => {
  try {
    const { clientIds } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client IDs array is required'
      });
    }

    const result = await Client.deleteMany({ _id: { $in: clientIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} clients deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Error bulk deleting clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete clients',
      error: error.message
    });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const documentData = {
      documentType,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    if (!client.documents) {
      client.documents = new Map();
    }
    
    client.documents.set(documentType, documentData);
    await client.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: documentData
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Get client documents
const getClientDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const documents = client.documents ? Object.fromEntries(client.documents) : {};

    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (client.documents && client.documents.has(documentId)) {
      client.documents.delete(documentId);
      await client.save();
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Export clients
const exportClients = async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.body;

    let query = {};
    
    // Apply filters
    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }
    if (filters.type && filters.type !== 'all') {
      query.clientType = filters.type;
    }

    const clients = await Client.find(query)
      .populate('agentId', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV content
      const csvHeader = 'Client ID,Name,Email,Phone,Status,Type,Agent,Created At\n';
      const csvRows = clients.map(client => 
        `${client.clientId},${client.name || ''},${client.email},${client.phone},${client.status},${client.clientType},${client.agentId?.name || ''},${client.createdAt.toISOString()}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=clients_export.csv');
      return res.send(csvContent);
    }

    res.status(200).json({
      success: true,
      data: clients,
      count: clients.length
    });
  } catch (error) {
    console.error('Error exporting clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export clients',
      error: error.message
    });
  }
};

// Add client note
const addClientNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, priority = 'medium', category = 'general' } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const note = {
      content,
      priority,
      category,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    client.notes.push(note);
    await client.save();

    await client.populate('notes.createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: client.notes[client.notes.length - 1]
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
};

// Get client notes
const getClientNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id)
      .populate('notes.createdBy', 'name email');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client.notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error.message
    });
  }
};

// Update client note
const updateClientNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { content } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const note = client.notes.id(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.content = content;
    note.updatedAt = new Date();
    await client.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: error.message
    });
  }
};

// Delete client note
const deleteClientNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const note = client.notes.id(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    client.notes.pull(noteId);
    await client.save();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error.message
    });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getClientStats,
  getClientsByAgent,
  assignClientToAgent,
  bulkUpdateClients,
  bulkDeleteClients,
  uploadDocument,
  getClientDocuments,
  deleteDocument,
  exportClients,
  addClientNote,
  getClientNotes,
  updateClientNote,
  deleteClientNote
};
