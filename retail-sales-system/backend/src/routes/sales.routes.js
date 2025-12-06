import express from 'express';
import { getSales, getSaleById, searchSales, getSalesStats, getFilterOptions } from '../controllers/sales.controller.js';
import { validateSearchQuery, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// GET /api/sales - Get all sales with pagination, filtering, and sorting
router.get('/', validatePagination, getSales);

// GET /api/sales/search - Search sales with full-text search
router.get('/search', validateSearchQuery, searchSales);

// GET /api/sales/stats - Get sales statistics
router.get('/stats', getSalesStats);

// GET /api/sales/filters - Get available filter options
router.get('/filters', getFilterOptions);

// GET /api/sales/:id - Get a single sale by ID
router.get('/:id', getSaleById);

export default router;
