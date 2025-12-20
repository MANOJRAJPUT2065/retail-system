import { useState, useEffect } from 'react';
import salesAPI from '../services/api';
import '../styles/OrderHistory.css';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getOrderHistory();
      setOrders(response.data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    if (filter !== 'all') {
      filtered = filtered.filter(order => order.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id?.includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.includes(searchTerm)
      );
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#2196F3',
      completed: '#4caf50',
      cancelled: '#f44336',
      shipped: '#00bcd4'
    };
    return colors[status] || '#999';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      pending: '⏳',
      processing: '⚙️',
      completed: '✅',
      cancelled: '❌',
      shipped: '📦'
    };
    return emojis[status] || '•';
  };

  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="order-history-page">
      <h1>📋 Order History</h1>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
          <div className="stat-label">Revenue (Completed)</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="pending">⏳ Pending</option>
            <option value="processing">⚙️ Processing</option>
            <option value="completed">✅ Completed</option>
            <option value="shipped">📦 Shipped</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="🔍 Search by Order ID, Customer, or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <p className="loading">Loading orders...</p>}

      {!loading && filteredOrders.length === 0 && (
        <p className="no-data">No orders found</p>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div
              key={order._id}
              className={`order-card status-${order.status}`}
              onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
            >
              <div className="order-header">
                <div className="order-title">
                  <span className="order-id">Order #{order._id?.substring(0, 8)}</span>
                  <span className="status-badge" style={{ borderColor: getStatusColor(order.status) }}>
                    {getStatusEmoji(order.status)} {order.status?.toUpperCase()}
                  </span>
                </div>
                <div className="order-amount">${order.totalAmount?.toFixed(2) || '0.00'}</div>
              </div>

              <div className="order-summary">
                <div className="summary-item">
                  <span className="label">Customer:</span>
                  <span className="value">{order.customerName || 'N/A'}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Phone:</span>
                  <span className="value">{order.customerPhone || 'N/A'}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Items:</span>
                  <span className="value">{order.items?.length || 0} items</span>
                </div>
                <div className="summary-item">
                  <span className="label">Date:</span>
                  <span className="value">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedOrder?._id === order._id && (
                <div className="order-details-expanded">
                  <h4>Order Details</h4>

                  <div className="items-section">
                    <h5>Items Ordered:</h5>
                    {order.items && order.items.length > 0 ? (
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.productName || item.name || 'Unknown'}</td>
                              <td>{item.quantity}</td>
                              <td>${item.price?.toFixed(2) || '0.00'}</td>
                              <td>${(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No items</p>
                    )}
                  </div>

                  <div className="info-grid">
                    <div className="info-box">
                      <span className="label">Subtotal:</span>
                      <span className="value">${(order.subtotal || order.totalAmount)?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-box">
                      <span className="label">Tax:</span>
                      <span className="value">${(order.tax || 0)?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-box highlight">
                      <span className="label">Total:</span>
                      <span className="value">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-box">
                      <span className="label">Payment:</span>
                      <span className="value">{order.paymentMethod || 'Not specified'}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="notes-section">
                      <h5>Notes:</h5>
                      <p>{order.notes}</p>
                    </div>
                  )}

                  <div className="timeline">
                    <h5>Timeline:</h5>
                    <div className="timeline-item">
                      <span className="time">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                      </span>
                      <span className="event">Order Created</span>
                    </div>
                    {order.updatedAt && order.updatedAt !== order.createdAt && (
                      <div className="timeline-item">
                        <span className="time">{new Date(order.updatedAt).toLocaleString()}</span>
                        <span className="event">Last Updated</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
