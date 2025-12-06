// src/routes/product.routes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStats,
  getCategories,
  getBrands
} from '../controllers/product.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  listProductsSchema,
  getProductSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  searchProductsSchema
} from '../validations/product.validations.js';

const router = express.Router();

// Public routes
router.get('/', validate(listProductsSchema), getProducts);
router.get('/search', validate(searchProductsSchema), searchProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/stats', getProductStats);
router.get('/:id', validate(getProductSchema), getProductById);

// Protected routes (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(deleteProductSchema),
  deleteProduct
);

export default router;