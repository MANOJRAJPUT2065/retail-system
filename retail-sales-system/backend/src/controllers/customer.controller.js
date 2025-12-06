import Customer from '../models/customer.model.js';
import Sale from '../models/sale.model.js';
import { validationResult } from 'express-validator';

// @desc    Get all customers with pagination and filtering
// @route   GET /api/customers
// @access  Public
export const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter criteria
    const filter = {};
    
    // Apply filters from query parameters
    if (req.query.region) filter.region = req.query.region;
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.customerType) filter.customerType = req.query.customerType;
    
    // Age range filter
    if (req.query.minAge || req.query.maxAge) {
      filter.age = {};
      if (req.query.minAge) filter.age.$gte = parseInt(req.query.minAge);
      if (req.query.maxAge) filter.age.$lte = parseInt(req.query.maxAge);
    }
    
    // Text search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { phoneNumber: searchRegex },
        { customerId: searchRegex }
      ];
    }
    
    // Get total count for pagination
    const total = await Customer.countDocuments(filter);
    
    // Get paginated customers
    const customers = await Customer.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Calculate pagination metadata
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;
    
    res.json({
      data: customers,
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
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search customers with full-text search
// @route   GET /api/customers/search
// @access  Public
export const searchCustomers = async (req, res) => {
  try {
    const { q: searchQuery } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Text search on customer fields
    const searchResults = await Customer.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { phoneNumber: { $regex: searchQuery, $options: 'i' } },
            { customerId: { $regex: searchQuery, $options: 'i' } },
            { region: { $regex: searchQuery, $options: 'i' } }
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
                _id: 0,
                id: '$_id',
                customerId: 1,
                name: 1,
                phoneNumber: 1,
                gender: 1,
                age: 1,
                region: 1,
                customerType: 1,
                createdAt: 1
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
    console.error('Error searching customers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Public
export const getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $facet: {
          totalCustomers: [
            { $count: 'count' }
          ],
          byGender: [
            { $group: { _id: '$gender', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byRegion: [
            { $group: { _id: '$region', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ],
          byAgeGroup: [
            {
              $bucket: {
                groupBy: '$age',
                boundaries: [0, 18, 25, 35, 45, 55, 65, 100],
                default: '65+',
                output: {
                  count: { $sum: 1 },
                  avgAge: { $avg: '$age' }
                }
              }
            },
            { $sort: { _id: 1 } }
          ],
          byCustomerType: [
            { $group: { _id: '$customerType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      },
      {
        $project: {
          totalCustomers: { $arrayElemAt: ['$totalCustomers.count', 0] },
          byGender: 1,
          topRegions: '$byRegion',
          byAgeGroup: {
            $map: {
              input: '$byAgeGroup',
              as: 'group',
              in: {
                ageGroup: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$$group._id', 0] }, then: '0-17' },
                      { case: { $eq: ['$$group._id', 18] }, then: '18-24' },
                      { case: { $eq: ['$$group._id', 25] }, then: '25-34' },
                      { case: { $eq: ['$$group._id', 35] }, then: '35-44' },
                      { case: { $eq: ['$$group._id', 45] }, then: '45-54' },
                      { case: { $eq: ['$$group._id', 55] }, then: '55-64' },
                      { case: { $eq: ['$$group._id', '65+'] }, then: '65+' }
                    ],
                    default: 'Unknown'
                  }
                },
                count: '$$group.count',
                avgAge: { $round: ['$$group.avgAge', 1] }
              }
            }
          },
          byCustomerType: 1
        }
      }
    ]);
    
    // Get customer lifetime value (total spent) stats
    const spendingStats = await Sale.aggregate([
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$finalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$finalAmount' }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $group: {
          _id: null,
          avgLifetimeValue: { $avg: '$totalSpent' },
          maxLifetimeValue: { $max: '$totalSpent' },
          minLifetimeValue: { $min: '$totalSpent' },
          totalRevenue: { $sum: '$totalSpent' },
          avgOrdersPerCustomer: { $avg: '$orderCount' },
          topSpenders: {
            $push: {
              customerId: '$customer.customerId',
              name: '$customer.name',
              totalSpent: '$totalSpent',
              orderCount: '$orderCount'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          avgLifetimeValue: { $round: ['$avgLifetimeValue', 2] },
          maxLifetimeValue: { $round: ['$maxLifetimeValue', 2] },
          minLifetimeValue: { $round: ['$minLifetimeValue', 2] },
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgOrdersPerCustomer: { $round: ['$avgOrdersPerCustomer', 1] },
          topSpenders: {
            $slice: [
              {
                $sortArray: {
                  input: '$topSpenders',
                  sortBy: { totalSpent: -1 }
                }
              },
              5
            ]
          }
        }
      }
    ]);
    
    // Combine the stats
    const result = {
      ...stats[0],
      spendingStats: spendingStats[0] || {}
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single customer by ID
// @route   GET /api/customers/:id
// @access  Public
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get customer's order history
    const orders = await Sale.find({ customer: req.params.id })
      .populate('product', 'name brand category')
      .sort({ date: -1 })
      .limit(10)
      .lean();
    
    // Calculate customer lifetime value
    const lifetimeValue = await Sale.aggregate([
      { $match: { customer: customer._id } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$finalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$finalAmount' },
          firstOrderDate: { $min: '$date' },
          lastOrderDate: { $max: '$date' }
        }
      }
    ]);
    
    const customerData = {
      ...customer,
      orders,
      stats: lifetimeValue[0] || {
        totalSpent: 0,
        orderCount: 0,
        avgOrderValue: 0
      }
    };
    
    res.json(customerData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private/Admin
export const createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { customerId, name, phoneNumber, gender, age, region, customerType } = req.body;
    
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [
        { customerId },
        { phoneNumber }
      ]
    });
    
    if (existingCustomer) {
      return res.status(400).json({
        message: 'Customer with this ID or phone number already exists'
      });
    }
    
    // Create new customer
    const customer = new Customer({
      customerId,
      name,
      phoneNumber,
      gender,
      age,
      region,
      customerType: customerType || 'Regular'
    });
    
    await customer.save();
    
    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
export const updateCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, phoneNumber, gender, age, region, customerType } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Update customer fields
    if (name) customer.name = name;
    if (phoneNumber) customer.phoneNumber = phoneNumber;
    if (gender) customer.gender = gender;
    if (age) customer.age = age;
    if (region) customer.region = region;
    if (customerType) customer.customerType = customerType;
    
    await customer.save();
    
    res.json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = async (req, res) => {
  try {
    // Check if customer has any orders
    const hasOrders = await Sale.exists({ customer: req.params.id });
    
    if (hasOrders) {
      return res.status(400).json({
        message: 'Cannot delete customer with existing orders. Please delete orders first.'
      });
    }
    
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({
      message: 'Customer deleted successfully',
      customerId: customer._id
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
