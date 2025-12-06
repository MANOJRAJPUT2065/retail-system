import express from 'express';
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  searchCustomers,
  getCustomerStats
} from '../controllers/customer.controller.js';
import { validatePagination } from '../middleware/validation.js';

const router = express.Router();

// GET /api/customers - Get all customers with pagination and filtering
router.get('/', validatePagination, getCustomers);

// GET /api/customers/search - Search customers with full-text search
router.get('/search', searchCustomers);

// GET /api/customers/stats - Get customer statistics
router.get('/stats', getCustomerStats);

// GET /api/customers/:id - Get a single customer by ID
router.get('/:id', getCustomerById);

// POST /api/customers - Create a new customer
router.post('/', createCustomer);

// PUT /api/customers/:id - Update a customer
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', deleteCustomer);

export default router;
