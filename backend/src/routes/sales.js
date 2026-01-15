const express = require('express');
const router = express.Router();
const multer = require('multer');
const salesController = require('../controllers/salesController');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Get paginated sales with search, filter, sort
router.get('/', salesController.getSales);

// Get available filter options
router.get('/filters', salesController.getFilterOptions);

// Get dashboard statistics
router.get('/dashboard/stats', salesController.getDashboardStats);

// Get sales trends
router.get('/trends', salesController.getSalesTrends);

// Debug: totals and sample docs
router.get('/debug', salesController.getSalesDebug);

// Export sales data as CSV
router.get('/export/csv', salesController.exportSalesCSV);

// Create quick order
router.post('/quick-order', salesController.createQuickOrder);

// Upload CSV file
router.post('/upload-csv', upload.single('file'), salesController.uploadCSV);

// Bulk delete sales
router.delete('/bulk-delete', salesController.bulkDeleteSales);

module.exports = router;

