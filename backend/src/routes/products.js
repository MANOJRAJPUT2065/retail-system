const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventory
} = require('../controllers/productController');

// Get all products
router.get('/', getProducts);

// Get inventory (same as products but with stock info)
router.get('/inventory', getInventory);

// Create new product
router.post('/', createProduct);

// Update product
router.put('/:id', updateProduct);

// Delete product
router.delete('/:id', deleteProduct);

module.exports = router;
