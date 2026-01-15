const Sale = require('../models/Sale');

// Get order history
exports.getOrderHistory = async (req, res) => {
  try {
    const { sortOrder = 'newest', status, search, limit = 500 } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    // Search by customer name, phone, or order ID
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort order
    const sort = sortOrder === 'oldest' ? { date: 1 } : { date: -1 };
    
    const sales = await Sale.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .lean();
    
    // Transform sales to order format
    const orders = sales.map(sale => ({
      _id: sale._id,
      customerName: sale.customerName,
      customerPhone: sale.phoneNumber,
      status: sale.orderStatus || 'completed',
      totalAmount: sale.finalAmount,
      subtotal: sale.totalAmount,
      tax: sale.totalAmount - sale.finalAmount,
      paymentMethod: sale.paymentMethod,
      createdAt: sale.date || sale.createdAt,
      updatedAt: sale.updatedAt,
      items: [
        {
          productName: sale.productName,
          name: sale.productName,
          quantity: sale.quantity,
          price: sale.pricePerUnit
        }
      ],
      notes: `Order from ${sale.customerRegion} - ${sale.deliveryType} delivery`
    }));
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Sale.findById(id).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'shipped', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Sale.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
};
