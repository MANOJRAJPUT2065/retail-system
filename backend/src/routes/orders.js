const express = require('express');
const router = express.Router();
const {
  getOrderHistory,
  getOrderDetails,
  updateOrderStatus
} = require('../controllers/orderController');

// Get all orders
router.get('/history', getOrderHistory);

// Get order details
router.get('/:id', getOrderDetails);

// Update order status
router.put('/:id/status', updateOrderStatus);

module.exports = router;
