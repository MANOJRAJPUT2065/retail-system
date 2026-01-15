const salesService = require('../services/salesService');

const getSales = async (req, res) => {
  console.log('Get sales request with query:', req.query);
  try {
    const {
      page = 1,
      limit = 10,
      search,
      regions,
      genders,
      ageMin,
      ageMax,
      categories,
      tags,
      paymentMethods,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      search,
      regions: regions ? regions.split(',') : [],
      genders: genders ? genders.split(',') : [],
      ageMin: ageMin ? parseInt(ageMin) : null,
      ageMax: ageMax ? parseInt(ageMax) : null,
      categories: categories ? categories.split(',') : [],
      tags: tags ? tags.split(',') : [],
      paymentMethods: paymentMethods ? paymentMethods.split(',') : [],
      dateFrom: dateFrom ? new Date(dateFrom) : null,
      dateTo: dateTo ? new Date(dateTo) : null,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 1 : -1
    };

    const result = await salesService.getSales(
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json(result);
    console.log('Sales data sent:', result);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
};

const getFilterOptions = async (req, res) => {
  try {
    const options = await salesService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await salesService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

const createQuickOrder = async (req, res) => {
  try {
    console.log('Quick order request received:', req.body);
    const orderData = req.body;
    const result = await salesService.createQuickOrder(orderData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating quick order:', error);
    const errorMessage = error.message || 'Failed to create order';
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await salesService.processCSVFile(req.file);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({ error: error.message || 'Failed to upload CSV' });
  }
};

const exportSalesCSV = async (req, res) => {
  try {
    const {
      search,
      regions,
      genders,
      ageMin,
      ageMax,
      categories,
      tags,
      paymentMethods,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      search,
      regions: regions ? regions.split(',') : [],
      genders: genders ? genders.split(',') : [],
      ageMin: ageMin ? parseInt(ageMin) : null,
      ageMax: ageMax ? parseInt(ageMax) : null,
      categories: categories ? categories.split(',') : [],
      tags: tags ? tags.split(',') : [],
      paymentMethods: paymentMethods ? paymentMethods.split(',') : [],
      dateFrom: dateFrom ? new Date(dateFrom) : null,
      dateTo: dateTo ? new Date(dateTo) : null,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 1 : -1
    };

    const result = await salesService.exportSalesAsCSV(filters);
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sales_export.csv"'
    });
    res.send(result);
  } catch (error) {
    console.error('Error exporting sales:', error);
    res.status(500).json({ error: 'Failed to export sales data' });
  }
};

const bulkDeleteSales = async (req, res) => {
  try {
    const { saleIds } = req.body;

    if (!Array.isArray(saleIds) || saleIds.length === 0) {
      return res.status(400).json({ error: 'Please provide sale IDs to delete' });
    }

    const result = await salesService.bulkDeleteSales(saleIds);
    res.json(result);
  } catch (error) {
    console.error('Error deleting sales:', error);
    res.status(500).json({ error: 'Failed to delete sales' });
  }
};

const getSalesTrends = async (req, res) => {
  try {
    const { timeframe = 'monthly', dateFrom, dateTo } = req.query;
    
    const validTimeframes = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({ error: 'Invalid timeframe' });
    }

    const result = await salesService.getSalesTrends(timeframe, dateFrom, dateTo);
    res.json(result);
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    res.status(500).json({ error: 'Failed to fetch sales trends' });
  }
};

const getSalesDebug = async (req, res) => {
  try {
    const info = await salesService.getSalesDebug();
    res.json(info);
  } catch (error) {
    console.error('Error fetching sales debug:', error);
    res.status(500).json({ error: 'Failed to fetch sales debug info' });
  }
};

module.exports = {
  getSales,
  getFilterOptions,
  getDashboardStats,
  createQuickOrder,
  uploadCSV,
  exportSalesCSV,
  bulkDeleteSales,
  getSalesTrends,
  getSalesDebug
};

