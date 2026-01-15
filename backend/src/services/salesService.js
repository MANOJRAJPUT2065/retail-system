const Sale = require('../models/Sale');
const Product = require('../models/product.model');
const { buildQuery, buildSort } = require('../utils/queryBuilder');
const fs = require('fs');
const csv = require('csv-parser');

const getSales = async (page, limit, filters) => {
  try {
    const query = buildQuery(filters);
    const sort = buildSort(filters.sortBy, filters.sortOrder);

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Sale.countDocuments(query)
    ]);

    return {
      sales,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    throw new Error(`Error fetching sales: ${error.message}`);
  }
};

const getFilterOptions = async () => {
  try {
    const [
      regions,
      genders,
      categories,
      tags,
      paymentMethods,
      ageRange
    ] = await Promise.all([
      Sale.distinct('customerRegion'),
      Sale.distinct('gender'),
      Sale.distinct('productCategory'),
      Sale.distinct('tags'),
      Sale.distinct('paymentMethod'),
      Sale.aggregate([
        {
          $group: {
            _id: null,
            minAge: { $min: '$age' },
            maxAge: { $max: '$age' }
          }
        }
      ])
    ]);

    // Flatten tags array
    const uniqueTags = [...new Set(tags.flat())];

    return {
      regions: regions.sort(),
      genders: genders.sort(),
      categories: categories.sort(),
      tags: uniqueTags.sort(),
      paymentMethods: paymentMethods.sort(),
      ageRange: ageRange[0] || { minAge: 0, maxAge: 100 }
    };
  } catch (error) {
    throw new Error(`Error fetching filter options: ${error.message}`);
  }
};

const getDashboardStats = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get current month stats
    const [currentStats, lastMonthStats, weeklyStats, topProducts, regionStats, recentActivity] = await Promise.all([
      // Current month stats
      Sale.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalRevenue: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$finalAmount' }
          }
        }
      ]),

      // Last month stats for comparison
      Sale.aggregate([
        { $match: { date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            totalRevenue: { $sum: '$finalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$finalAmount' }
          }
        }
      ]),

      // Weekly sales for chart (last 7 days)
      Sale.aggregate([
        { $match: { date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            sales: { $sum: '$finalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Top products by category
      Sale.aggregate([
        {
          $group: {
            _id: '$productCategory',
            sales: { $sum: '$finalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 }
      ]),

      // Sales by region
      Sale.aggregate([
        {
          $group: {
            _id: '$customerRegion',
            value: { $sum: '$finalAmount' }
          }
        }
      ]),

      // Recent sales activity (last 5)
      Sale.find()
        .sort({ date: -1 })
        .limit(5)
        .select('customerName productName finalAmount orderStatus date')
        .lean()
    ]);

    // Calculate growth percentages
    const current = currentStats[0] || { totalSales: 0, totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const last = lastMonthStats[0] || { totalSales: 0, totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    const calculateGrowth = (current, last) => {
      if (last === 0) return 0;
      return (((current - last) / last) * 100).toFixed(1);
    };

    // Calculate total sales for region percentages
    const totalRegionSales = regionStats.reduce((sum, r) => sum + r.value, 0);

    return {
      stats: {
        totalSales: Math.round(current.totalSales),
        totalRevenue: Math.round(current.totalRevenue),
        totalOrders: current.totalOrders,
        avgOrderValue: Math.round(current.avgOrderValue),
        growths: {
          sales: calculateGrowth(current.totalSales, last.totalSales),
          revenue: calculateGrowth(current.totalRevenue, last.totalRevenue),
          orders: calculateGrowth(current.totalOrders, last.totalOrders),
          avgOrder: calculateGrowth(current.avgOrderValue, last.avgOrderValue)
        }
      },
      weeklyStats: weeklyStats.map(day => ({
        date: day._id,
        sales: Math.round(day.sales)
      })),
      topProducts: topProducts.map(p => ({
        name: p._id,
        sales: Math.round(p.sales),
        count: p.count
      })),
      regionStats: regionStats.map(r => ({
        region: r._id,
        value: Math.round(r.value),
        percentage: totalRegionSales > 0 ? Math.round((r.value / totalRegionSales) * 100) : 0
      })),
      recentActivity: recentActivity.map(sale => ({
        action: `${sale.customerName} purchased ${sale.productName}`,
        amount: Math.round(sale.finalAmount),
        status: sale.orderStatus,
        time: sale.date
      }))
    };
  } catch (error) {
    throw new Error(`Error fetching dashboard stats: ${error.message}`);
  }
};

const createQuickOrder = async (orderData) => {
  try {
    console.log('Received order data:', JSON.stringify(orderData, null, 2));
    
    const { customerName, phoneNumber, email, customerRegion, gender, age, paymentMethod, items } = orderData;

    if (!items || items.length === 0) {
      throw new Error('No items in order');
    }

    // Generate IDs
    const customerId = `CUST-${Date.now()}`;
    const storeId = `STORE-001`;
    const salespersonId = `EMP-${Math.floor(Math.random() * 1000)}`;

    // Create sales records for each item
    const salesRecords = items.map((item, index) => {
      try {
        const qty = parseInt(item.quantity) || 1;
        const pricePerUnit = parseFloat(item.pricePerUnit) || 0;
        const discount = parseFloat(item.discountPercentage) || 0;
        
        const totalAmount = qty * pricePerUnit;
        const discountAmount = (totalAmount * discount) / 100;
        const finalAmount = totalAmount - discountAmount;

        const record = {
          customerId,
          customerName: customerName?.trim() || 'Guest',
          phoneNumber: phoneNumber?.trim() || '0000000000',
          gender: gender || 'Other',
          age: parseInt(age) || 0,
          customerRegion: customerRegion || 'North',
          customerType: 'Regular',
          productId: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productName: item.productName?.trim() || 'Unknown Product',
          brand: 'Generic',
          productCategory: item.productCategory || 'Electronics',
          tags: [item.productCategory?.toLowerCase() || 'general'],
          quantity: qty,
          pricePerUnit: pricePerUnit,
          discountPercentage: discount,
          totalAmount: totalAmount,
          finalAmount: finalAmount,
          date: new Date(),
          paymentMethod: paymentMethod || 'Cash',
          orderStatus: 'Completed',
          deliveryType: 'Standard',
          storeId,
          storeLocation: customerRegion || 'North',
          salespersonId,
          employeeName: 'Quick Order'
        };

        console.log(`Item ${index + 1} record:`, record);
        return record;
      } catch (itemError) {
        console.error(`Error processing item ${index + 1}:`, itemError);
        throw itemError;
      }
    });

    console.log(`Preparing to insert ${salesRecords.length} sales records`);
    
    // Insert all sales records
    const result = await Sale.insertMany(salesRecords);

    // Update inventory based on items sold
    const totalsByProduct = new Map();
    items.forEach((item) => {
      const name = (item.productName || 'Unknown Product').trim();
      const qty = parseInt(item.quantity) || 1;
      totalsByProduct.set(name, (totalsByProduct.get(name) || 0) + qty);
    });

    // Apply inventory updates
    await Promise.all([
      ...Array.from(totalsByProduct.entries()).map(async ([name, qty]) => {
        const existing = await Product.findOne({ name });
        if (existing) {
          const newQty = Math.max(0, (existing.quantity || 0) - qty);
          existing.quantity = newQty;
          existing.updatedAt = new Date();
          await existing.save();
        } else {
          await Product.create({
            name,
            category: 'Uncategorized',
            price: 0,
            quantity: 0,
            description: 'Auto-created from sale',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      })
    ]);

    console.log('Successfully inserted records:', result.length);

    return {
      success: true,
      message: `Order placed successfully! ${result.length} items added.`,
      count: result.length,
      orderId: customerId
    };
  } catch (error) {
    console.error('Error in createQuickOrder:', error);
    throw error;
  }
};

const processCSVFile = async (file) => {
  const MAX_RECORDS = 1000; // Maximum records per CSV upload

  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let rowCount = 0;

    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (row) => {
        try {
          rowCount++;

          // Check if row limit exceeded
          if (rowCount > MAX_RECORDS) {
            errors.push(`Row ${rowCount}: Upload limit exceeded (max ${MAX_RECORDS} records)`);
            return;
          }

          // Parse and validate CSV row
          const saleData = {
            customerId: row.customerId || `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            customerName: row.customerName,
            phoneNumber: row.phoneNumber || '0000000000',
            email: row.email || '',
            gender: row.gender,
            age: parseInt(row.age),
            customerRegion: row.customerRegion,
            customerType: row.customerType || 'Regular',
            productId: row.productId || `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productName: row.productName,
            brand: row.brand || 'Generic',
            productCategory: row.productCategory,
            tags: row.tags ? row.tags.split(';') : [],
            quantity: parseInt(row.quantity),
            pricePerUnit: parseFloat(row.pricePerUnit),
            discountPercentage: parseFloat(row.discountPercentage) || 0,
            totalAmount: parseFloat(row.totalAmount) || (parseInt(row.quantity) * parseFloat(row.pricePerUnit)),
            finalAmount: parseFloat(row.finalAmount) || (parseInt(row.quantity) * parseFloat(row.pricePerUnit) * (1 - parseFloat(row.discountPercentage || 0) / 100)),
            date: row.date ? new Date(row.date) : new Date(),
            paymentMethod: row.paymentMethod,
            orderStatus: row.orderStatus || 'Completed',
            deliveryType: row.deliveryType || 'Standard',
            storeId: row.storeId || 'STORE-001',
            storeLocation: row.storeLocation || row.customerRegion,
            salespersonId: row.salespersonId || `EMP-${Math.floor(Math.random() * 1000)}`,
            employeeName: row.employeeName || 'CSV Upload'
          };

          results.push(saleData);
        } catch (err) {
          errors.push({ row, error: err.message });
        }
      })
      .on('end', async () => {
        try {
          // Clean up uploaded file
          fs.unlinkSync(file.path);

          // Check if limit was exceeded
          if (rowCount > MAX_RECORDS) {
            return reject(new Error(`Upload limit exceeded! ${rowCount} records found, max ${MAX_RECORDS} allowed. Please split into multiple files.`));
          }

          if (results.length === 0) {
            return reject(new Error('No valid data found in CSV'));
          }

          // Insert all valid records
          const inserted = await Sale.insertMany(results);

          resolve({
            success: true,
            message: `✅ Successfully imported ${inserted.length} records`,
            count: inserted.length,
            rowCount: results.length,
            errors: errors.length > 0 ? errors : undefined
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        // Clean up uploaded file on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        reject(error);
      });
  });
};

const exportSalesAsCSV = async (filters) => {
  try {
    const query = buildQuery(filters);
    const sort = buildSort(filters.sortBy, filters.sortOrder);

    const sales = await Sale.find(query).sort(sort).lean();

    if (sales.length === 0) {
      return 'No data to export\n';
    }

    // Get all keys from sales data
    const keys = Object.keys(sales[0]).filter(key => key !== '__v' && key !== '_id');
    
    // Create CSV header
    const header = keys.join(',') + '\n';

    // Create CSV rows
    const rows = sales.map(sale => {
      return keys.map(key => {
        const value = sale[key];
        if (Array.isArray(value)) {
          return `"${value.join(';')}"`;
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value || '';
      }).join(',');
    }).join('\n');

    return header + rows;
  } catch (error) {
    throw new Error(`Error exporting sales: ${error.message}`);
  }
};

const bulkDeleteSales = async (saleIds) => {
  try {
    const result = await Sale.deleteMany({ _id: { $in: saleIds } });

    return {
      success: true,
      message: `Successfully deleted ${result.deletedCount} sales records`,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    throw new Error(`Error deleting sales: ${error.message}`);
  }
};

const getSalesTrends = async (timeframe, dateFrom, dateTo) => {
  try {
    let groupBy;
    let dateFormat;

    switch (timeframe) {
      case 'daily':
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        dateFormat = 'date';
        break;
      case 'weekly':
        groupBy = { $week: '$date' };
        dateFormat = 'week';
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: '%Y-%m', date: '$date' } };
        dateFormat = 'month';
        break;
      case 'yearly':
        groupBy = { $year: '$date' };
        dateFormat = 'year';
        break;
      default:
        groupBy = { $dateToString: { format: '%Y-%m', date: '$date' } };
        dateFormat = 'month';
    }

    // Build date filter
    const dateFilter = { date: { $exists: true } };
    if (dateFrom || dateTo) {
      dateFilter.date = {};
      if (dateFrom) {
        dateFilter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = endDate;
      }
    }

    const trends = await Sale.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const formattedData = trends.map(trend => {
      const obj = {
        [dateFormat]: trend._id,
        revenue: trend.revenue || 0,
        orderCount: trend.orderCount || 0,
        avgOrderValue: trend.avgOrderValue || 0
      };

      if (dateFormat === 'date') obj.date = trend._id;
      if (dateFormat === 'month') obj.month = trend._id;
      if (dateFormat === 'year') obj.year = trend._id;

      return obj;
    });

    // Calculate growth
    let growth = 0;
    if (formattedData.length >= 2) {
      const current = formattedData[formattedData.length - 1];
      const previous = formattedData[formattedData.length - 2];
      growth = ((current.revenue - previous.revenue) / previous.revenue) * 100;
    }

    // Calculate summary
    const summary = {
      totalRevenue: formattedData.reduce((sum, item) => sum + item.revenue, 0),
      totalOrders: formattedData.reduce((sum, item) => sum + item.orderCount, 0),
      avgOrderValue: formattedData.reduce((sum, item) => sum + item.avgOrderValue, 0) / formattedData.length || 0,
      growth: growth
    };

    return {
      summary,
      data: formattedData
    };
  } catch (error) {
    throw new Error(`Error fetching sales trends: ${error.message}`);
  }
};

module.exports = {
  getSales,
  getFilterOptions,
  getDashboardStats,
  createQuickOrder,
  processCSVFile,
  exportSalesAsCSV,
  bulkDeleteSales,
  getSalesTrends,
  getSalesDebug: async () => {
    const total = await Sale.countDocuments({});
    const sample = await Sale.find({}).sort({ date: -1 }).limit(5).lean();
    return {
      total,
      sample: sample.map(s => ({
        customerName: s.customerName,
        phoneNumber: s.phoneNumber,
        productName: s.productName,
        productCategory: s.productCategory,
        quantity: s.quantity,
        finalAmount: s.finalAmount,
        date: s.date
      }))
    };
  }
};

