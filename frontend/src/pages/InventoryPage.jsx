import { useState, useEffect } from 'react';
import salesAPI from '../services/api';
import '../styles/Inventory.css';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, low, outofstock

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getInventory();
      setInventory(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInventory = () => {
    switch (filter) {
      case 'low':
        return inventory.filter(item => item.quantity > 0 && item.quantity <= 10);
      case 'outofstock':
        return inventory.filter(item => item.quantity === 0);
      default:
        return inventory;
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 10) return 'low-stock';
    return 'in-stock';
  };

  const stats = {
    total: inventory.length,
    inStock: inventory.filter(item => item.quantity > 0).length,
    lowStock: inventory.filter(item => item.quantity > 0 && item.quantity <= 10).length,
    outOfStock: inventory.filter(item => item.quantity === 0).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  };

  const filteredInventory = getFilteredInventory();

  return (
    <div className="inventory-page">
      <h1>📦 Inventory Management</h1>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card instock">
          <div className="stat-value">{stats.inStock}</div>
          <div className="stat-label">In Stock</div>
        </div>
        <div className="stat-card low">
          <div className="stat-value">{stats.lowStock}</div>
          <div className="stat-label">Low Stock</div>
        </div>
        <div className="stat-card outofstock">
          <div className="stat-value">{stats.outOfStock}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
        <div className="stat-card value">
          <div className="stat-value">${stats.totalValue.toFixed(2)}</div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Products ({inventory.length})</option>
          <option value="low">Low Stock ({stats.lowStock})</option>
          <option value="outofstock">Out of Stock ({stats.outOfStock})</option>
        </select>
      </div>

      {loading && <p className="loading">Loading inventory...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && filteredInventory.length === 0 && (
        <p className="no-data">No products found</p>
      )}

      {!loading && filteredInventory.length > 0 && (
        <div className="inventory-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item._id} className={`status-${getStockStatus(item.quantity)}`}>
                  <td className="product-name">{item.name}</td>
                  <td>{item.category || 'N/A'}</td>
                  <td>${item.price?.toFixed(2) || 'N/A'}</td>
                  <td className="quantity">
                    {item.quantity}
                    {item.quantity <= 10 && item.quantity > 0 && (
                      <span className="alert">⚠️ Low</span>
                    )}
                    {item.quantity === 0 && (
                      <span className="alert">❌ Out</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${getStockStatus(item.quantity)}`}>
                      {getStockStatus(item.quantity).replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="total-value">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <div className="inventory-info">
          <p>⏱️ Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}
