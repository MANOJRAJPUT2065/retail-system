const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Get paginated sales with search, filter, sort
router.get('/', salesController.getSales);

// Get available filter options
router.get('/filters', salesController.getFilterOptions);

module.exports = router;

