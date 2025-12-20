import { useState, useEffect } from 'react';
import salesAPI from '../services/api';
import '../styles/ProductManagement.css';

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState(['Electronics', 'Clothing', 'Food', 'Home']);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    quantity: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await salesAPI.updateProduct(editingId, formData);
      } else {
        await salesAPI.createProduct(formData);
      }
      fetchProducts();
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await salesAPI.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Electronics',
      price: '',
      quantity: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: products.length,
    categories: new Set(products.map(p => p.category)).size,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    avgPrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0
  };

  return (
    <div className="product-management-page">
      <h1>🛍️ Product Management</h1>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.categories}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${stats.avgPrice.toFixed(2)}</div>
          <div className="stat-label">Avg Price</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${stats.totalValue.toFixed(2)}</div>
          <div className="stat-label">Total Stock Value</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-add"
        >
          {showForm ? '✕ Cancel' : '➕ Add Product'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="product-form">
          <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingId ? '💾 Update Product' : '✅ Create Product'}
              </button>
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p className="loading">Loading products...</p>}

      {!loading && filteredProducts.length === 0 && (
        <p className="no-data">
          {searchTerm ? 'No products match your search' : 'No products yet. Add one to get started!'}
        </p>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className="category-badge">{product.category}</span>
              </div>

              <p className="description">{product.description || 'No description'}</p>

              <div className="product-details">
                <div className="detail">
                  <span className="label">Price:</span>
                  <span className="value">${product.price?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="detail">
                  <span className="label">Stock:</span>
                  <span className={`value ${product.quantity <= 10 ? 'low' : ''}`}>
                    {product.quantity} units
                  </span>
                </div>
              </div>

              <div className="product-actions">
                <button
                  onClick={() => handleEdit(product)}
                  className="btn-edit"
                  title="Edit product"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="btn-delete"
                  title="Delete product"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
