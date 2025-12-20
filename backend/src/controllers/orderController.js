const Sale = require('../models/Sale');

// Get order history
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
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
