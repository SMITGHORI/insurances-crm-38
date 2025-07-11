
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/upload');
const { validationMiddleware } = require('../middleware/validation');
const { clientValidation, updateClientValidation } = require('../validations/clientValidation');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/clients - Get all clients with pagination and filtering
router.get('/', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  clientController.getAllClients
);

// GET /api/clients/search/:query - Search clients
router.get('/search/:query', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  clientController.searchClients
);

// GET /api/clients/stats/summary - Get client statistics
router.get('/stats/summary', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  clientController.getClientStats
);

// GET /api/clients/agent/:agentId - Get clients by agent
router.get('/agent/:agentId', 
  roleMiddleware(['manager', 'admin', 'super_admin']),
  clientController.getClientsByAgent
);

// POST /api/clients/export - Export clients
router.post('/export', 
  roleMiddleware(['manager', 'admin', 'super_admin']),
  clientController.exportClients
);

// POST /api/clients/bulk-update - Bulk update clients
router.post('/bulk-update', 
  roleMiddleware(['manager', 'admin', 'super_admin']),
  clientController.bulkUpdateClients
);

// POST /api/clients/bulk-delete - Bulk delete clients
router.post('/bulk-delete', 
  roleMiddleware(['admin', 'super_admin']),
  clientController.bulkDeleteClients
);

// GET /api/clients/:id - Get client by ID
router.get('/:id', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  clientController.getClientById
);

// POST /api/clients - Create new client
router.post('/', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  validationMiddleware(clientValidation),
  clientController.createClient
);

// PUT /api/clients/:id - Update client
router.put('/:id', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  validationMiddleware(updateClientValidation),
  clientController.updateClient
);

// PUT /api/clients/:id/assign - Assign client to agent
router.put('/:id/assign', 
  roleMiddleware(['manager', 'admin', 'super_admin']),
  clientController.assignClientToAgent
);

// DELETE /api/clients/:id - Delete client
router.delete('/:id', 
  roleMiddleware(['manager', 'admin', 'super_admin']),
  clientController.deleteClient
);

// Document upload routes
router.post('/:id/documents', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  uploadMiddleware.single('document'),
  clientController.uploadDocument
);

router.get('/:id/documents', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  clientController.getClientDocuments
);

router.delete('/:id/documents/:documentId', 
  roleMiddleware(['manager', 'admin', 'super_admin']),
  clientController.deleteDocument
);

// Notes routes
router.post('/:id/notes', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  clientController.addClientNote
);

router.get('/:id/notes', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  clientController.getClientNotes
);

router.put('/:id/notes/:noteId', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  clientController.updateClientNote
);

router.delete('/:id/notes/:noteId', 
  roleMiddleware(['manager', 'admin', 'super_admin']),
  clientController.deleteClientNote
);

module.exports = router;
