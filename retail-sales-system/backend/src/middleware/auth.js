import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import { ROLES, hasPermission } from '../constants/roles.js';

/**
 * Protect routes with JWT authentication
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * Authorize roles middleware
 * @param {...string} roles - Roles that are allowed to access the route
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not authenticated');
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user.role} is not authorized to access this route`);
    }
    
    next();
  };
};

/**
 * Check if user has permission to perform an action
 * @param {string} requiredRole - The minimum required role
 */
export const checkPermission = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not authenticated');
    }
    
    if (!hasPermission(req.user.role, requiredRole)) {
      res.status(403);
      throw new Error('Not enough permissions to perform this action');
    }
    
    next();
  };
};

/**
 * Middleware to check if the user is the owner of the resource
 * @param {string} modelName - Name of the model to check ownership against
 * @param {string} idParam - Name of the route parameter containing the resource ID
 */
export const checkOwnership = (modelName, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}.model.js`);
      const resource = await Model.findById(req.params[idParam]);
      
      if (!resource) {
        res.status(404);
        throw new Error('Resource not found');
      }
      
      // Allow admins to access any resource
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }
      
      // Check if the resource has a user field and if it matches the current user
      if (resource.user && resource.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to access this resource');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
