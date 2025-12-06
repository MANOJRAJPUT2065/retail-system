// src/validations/product.validations.js
import { body, param, query } from 'express-validator';

// Validation for listing products
export const listProductsSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('category').optional().trim().escape(),
  query('brand').optional().trim().escape(),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number')
    .toFloat(),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.minPrice && value < req.query.minPrice) {
        throw new Error('Maximum price must be greater than minimum price');
      }
      return true;
    }),
  query('inStock')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('inStock must be either true or false'),
  query('sortBy')
    .optional()
    .matches(/^(name|price|createdAt|updated