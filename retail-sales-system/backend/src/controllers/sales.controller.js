import Sale from '../models/sale.model.js';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';
import { validationResult } from 'express-validator';

// Helper function to build filter criteria
const buildFilterCriteria = (query) => {
  const {
    startDate,
    endDate,
    minPrice,
    maxPrice,
    paymentMethod,
    orderStatus,
    deliveryType,
    storeId,
    customerId,
    productId,
    category,
    brand,
    region,
  } = query;

  const filter = {};

  // Date range filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of the day
      filter.date.$lte = end;
    }
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.finalAmount = {};
    if (minPrice) filter.finalAmount.$gte = parseFloat(minPrice);
    if (maxPrice) filter.finalAmount.$lte = parseFloat(maxPrice);
  }

  // Direct filters
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (orderStatus) filter.orderStatus = orderStatus;
  if (deliveryType) filter.deliveryType = deliveryType;
  if (storeId) filter.storeId = storeId;
  if (customerId) filter.customer = customerId;
  if (productId) filter.product = productId;
  
  // Populate filters
  if (category || brand) {
    filter['product'] = filter['product'] || {};
    if (category) filter['product'].category = category;
    if (brand) filter['product'].brand = brand;
  }
  
  if (region) {
    filter['customer'] = filter['customer'] || {};
    filter['customer'].region = region;
  }

  return filter;
};

// Helper function to build sort options
const buildSortOptions = (sortBy = 'date:desc') => {
  const [field, order] = sortBy.split(':');
  const sortOrder = order === 'asc' ? 1 : -1;
  
  const sortOptions = {};
  
  // Map sort fields to database fields
  switch (field) {
    case 'date':
      sortOptions.date = sortOrder;
      break;
    case 'amount':
      sortOptions.finalAmount = sortOrder;
      break;
    case 'customer':
      sortOptions['customer.name'] = sortOrder;
      break;
    default:
      sortOptions.createdAt = -1; // Default sort by creation date
  }
  
  return sortOptions;
};

// @desc    Get all sales with pagination, filtering, and sorting
// @route   GET /api/sales
// @access  Public
export const getSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'date:desc';
    
    // Build filter criteria
    const filter = buildFilterCriteria(req.query);
    const sortOptions = buildSortOptions(sortBy);
    
    // Get total count for pagination
    const total = await Sale.countDocuments(filter);
    
    // Get paginated and populated sales data
    const sales = await Sale.find(filter)
      .populate('customer', 'name phoneNumber region')
      .populate('product', 'name brand category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Calculate pagination metadata
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;
    
    res.json({
      data: sales,
      meta: {
        total,
        page,
        limit,
        pages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search sales with full-text search
// @route   GET /api/sales/search
// @access  Public
export const searchSales = async (req, res) => {
  try {
    const { q: searchQuery } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Text search on customer name, product name, and other relevant fields
    const searchResults = await Sale.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $match: {
          $or: [
            { 'customer.name': { $regex: searchQuery, $options: 'i' } },
            { 'customer.phoneNumber': { $regex: searchQuery, $options: 'i' } },
            { 'product.name': { $regex: searchQuery, $options: 'i' } },
            { 'product.brand': { $regex: searchQuery, $options: 'i' } },
            { orderId: { $regex: searchQuery, $options: 'i' } },
          ]
        }
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                'customer.name': 1,
                'customer.phoneNumber': 1,
                'customer.region': 1,
                'product.name': 1,
                'product.brand': 1,
                'product.category': 1,
                quantity: 1,
                pricePerUnit: 1,
                discountPercentage: 1,
                totalAmount: 1,
                finalAmount: 1,
                date: 1,
                paymentMethod: 1,
                orderStatus: 1,
                deliveryType: 1,
                storeId: 1,
                storeLocation: 1,
                employeeName: 1
              }
            }
          ],
          total: [{ $count: 'count' }]
        }
      }
    ]);
    
    const data = searchResults[0].data;
    const total = searchResults[0].total[0]?.count || 0;
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;
    
    res.json({
      data,
      meta: {
        total,
        page,
        limit,
        pages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error('Error searching sales:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single sale by ID
// @route   GET /api/sales/:id
// @access  Public
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phoneNumber email')
      .populate('product', 'name brand category price');
      
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats
// @access  Public
export const getSalesStats = async (req, res) => {
  try {
    const stats = await Sale.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$finalAmount' },
          avgOrderValue: { $avg: '$finalAmount' },
          totalProductsSold: { $sum: '$quantity' },
          byCategory: { $push: '$product.category' },
          byPaymentMethod: { $push: '$paymentMethod' },
          byDate: { $push: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
        }
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          totalProductsSold: 1,
          topCategories: {
            $slice: [
              {
                $reduce: {
                  input: '$byCategory',
                  initialValue: [],
                  in: {
                    $concatArrays: [
                      '$$value',
                      '$$this'
                    ]
                  }
                }
              },
              5
            ]
          },
          paymentMethods: {
            $reduce: {
              input: '$byPaymentMethod',
              initialValue: {},
              in: {
                $let: {
                  vars: {
                    method: '$$this',
                    count: { $add: [{ $ifNull: [{ $arrayElemAt: [{ $objectToArray: '$$value' }, 0] }, 0] }, 1] }
                  },
                  in: {
                    $mergeObjects: [
                      '$$value',
                      { '$$this': { $add: [{ $ifNull: [{ $arrayElemAt: [{ $objectToArray: '$$value' }, 0] }, 0] }, 1] } }
                    ]
                  }
                }
              }
            }
          },
          salesTrend: {
            $reduce: {
              input: '$byDate',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  { [this.$$this]: { $add: [{ $ifNull: ['$$value.this.$$this', 0] }, 1] } }
                ]
              }
            }
          }
        }
      }
    ]);
    
    res.json(stats[0] || {});
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available filter options
// @route   GET /api/sales/filters
// @access  Public
export const getFilterOptions = async (req, res) => {
  try {
    const [
      paymentMethods,
      orderStatuses,
      deliveryTypes,
      stores,
      categories,
      brands,
      regions
    ] = await Promise.all([
      Sale.distinct('paymentMethod'),
      Sale.distinct('orderStatus'),
      Sale.distinct('deliveryType'),
      Sale.distinct('storeId'),
      Product.distinct('category'),
      Product.distinct('brand'),
      Customer.distinct('region')
    ]);
    
    // Get min and max dates
    const dateRange = await Sale.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$date' },
          maxDate: { $max: '$date' },
          minAmount: { $min: '$finalAmount' },
          maxAmount: { $max: '$finalAmount' }
        }
      }
    ]);
    
    const { minDate, maxDate, minAmount, maxAmount } = dateRange[0] || {};
    
    res.json({
      paymentMethods,
      orderStatuses,
      deliveryTypes,
      stores: stores.filter(Boolean), // Remove any null/undefined values
      categories: categories.filter(Boolean),
      brands: brands.filter(Boolean),
      regions: regions.filter(Boolean),
      dateRange: {
        min: minDate,
        max: maxDate
      },
      amountRange: {
        min: minAmount || 0,
        max: maxAmount || 1000 // Default max if no data
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
