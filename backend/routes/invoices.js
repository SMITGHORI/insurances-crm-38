
const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
  sendInvoice
} = require('../controllers/invoiceController');
const {
  createInvoiceValidation,
  updateInvoiceValidation,
  getInvoiceValidation,
  sendInvoiceValidation,
  queryValidation
} = require('../validations/invoiceValidation');
const auth = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// GET /api/invoices - Get all invoices with filtering and pagination
router.get('/', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  queryValidation, 
  getInvoices
);

// GET /api/invoices/stats - Get invoice statistics
router.get('/stats', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  getInvoiceStats
);

// GET /api/invoices/:id - Get single invoice
router.get('/:id', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  getInvoiceValidation, 
  getInvoiceById
);

// POST /api/invoices - Create new invoice
router.post('/', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  createInvoiceValidation, 
  createInvoice
);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  updateInvoiceValidation, 
  updateInvoice
);

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', 
  roleMiddleware(['manager', 'admin', 'super_admin']),
  getInvoiceValidation, 
  deleteInvoice
);

// POST /api/invoices/:id/send - Send invoice via email
router.post('/:id/send', 
  roleMiddleware(['agent', 'manager', 'admin', 'super_admin']),
  sendInvoiceValidation, 
  sendInvoice
);

module.exports = router;
