import { useState } from 'react';
import '../styles/QuickOrder.css';

const QuickOrder = ({ onOrderSubmit }) => {
  const [cart, setCart] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    customerRegion: 'North',
    gender: 'Male',
    age: '',
    paymentMethod: 'Credit Card'
  });
  const [productForm, setProductForm] = useState({
    productName: '',
    productCategory: 'Electronics',
    quantity: 1,
    pricePerUnit: '',
    discountPercentage: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const categories = ['Electronics', 'Clothing', 'Beauty', 'Home & Garden', 'Sports', 'Books'];
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const paymentMethods = ['Credit Card', 'Debit Card', 'UPI', 'Cash', 'Net Banking'];

  const addToCart = () => {
    if (!productForm.productName || !productForm.pricePerUnit) {
      alert('Please fill product name and price');
      return;
    }

    const totalAmount = productForm.quantity * productForm.pricePerUnit;
    const discountAmount = (totalAmount * productForm.discountPercentage) / 100;
    const finalAmount = totalAmount - discountAmount;

    const cartItem = {
      ...productForm,
      id: Date.now(),
      totalAmount,
      finalAmount
    };

    setCart([...cart, cartItem]);
    setProductForm({
      productName: '',
      productCategory: 'Electronics',
      quantity: 1,
      pricePerUnit: '',
      discountPercentage: 0
    });
    setResult({ success: true, message: 'Added to cart!' });
    setTimeout(() => setResult(null), 2000);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.finalAmount, 0);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      setResult({ success: false, message: 'Cart is empty!' });
      return;
    }

    if (!formData.customerName || !formData.phoneNumber || !formData.age) {
      setResult({ success: false, message: 'Please fill all customer details (Name, Phone, Age)' });
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        customerRegion: formData.customerRegion,
        gender: formData.gender,
        age: parseInt(formData.age),
        paymentMethod: formData.paymentMethod,
        items: cart.map(item => ({
          productName: item.productName,
          productCategory: item.productCategory,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          discountPercentage: item.discountPercentage,
          totalAmount: item.totalAmount,
          finalAmount: item.finalAmount
        }))
      };

      console.log('Submitting order:', orderPayload);
      
      const response = await onOrderSubmit(orderPayload);
      
      setResult({
        success: true,
        message: `Order placed successfully! Order ID: ${response.orderId || 'N/A'}`
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setCart([]);
        setFormData({
          customerName: '',
          phoneNumber: '',
          email: '',
          customerRegion: 'North',
          gender: 'Male',
          age: '',
          paymentMethod: 'Credit Card'
        });
        setShowForm(false);
        setResult(null);
      }, 2000);
    } catch (error) {
      console.error('Order error:', error);
      setResult({
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to place order. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quick-order-container">
      <div className="quick-order-header">
        <h3>🛒 Quick Order Entry</h3>
        <div className="cart-badge">
          {cart.length} items • ₹{getTotalAmount().toLocaleString('en-IN')}
        </div>
      </div>

      {/* Product Entry Form */}
      <div className="product-entry">
        <h4>Add Products to Cart</h4>
        <div className="product-form-grid">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={productForm.productName}
              onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
              placeholder="Enter product name"
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select
              value={productForm.productCategory}
              onChange={(e) => setProductForm({ ...productForm, productCategory: e.target.value })}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={productForm.quantity}
              onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="form-group">
            <label>Price per Unit (₹)</label>
            <input
              type="number"
              min="0"
              value={productForm.pricePerUnit}
              onChange={(e) => setProductForm({ ...productForm, pricePerUnit: parseFloat(e.target.value) || '' })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={productForm.discountPercentage}
              onChange={(e) => setProductForm({ ...productForm, discountPercentage: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group add-btn-group">
            <button className="add-cart-btn" onClick={addToCart}>
              ➕ Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      {cart.length > 0 && (
        <div className="cart-items">
          <h4>Cart Items</h4>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <div className="item-name">{item.productName}</div>
                <div className="item-details">
                  {item.quantity}x ₹{item.pricePerUnit} • {item.productCategory}
                  {item.discountPercentage > 0 && ` • ${item.discountPercentage}% off`}
                </div>
              </div>
              <div className="cart-item-actions">
                <span className="item-price">₹{item.finalAmount.toLocaleString('en-IN')}</span>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  ❌
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <span>Total Amount:</span>
            <span className="total-value">₹{getTotalAmount().toLocaleString('en-IN')}</span>
          </div>

          {!showForm ? (
            <button className="checkout-btn" onClick={() => setShowForm(true)}>
              Proceed to Checkout 🚀
            </button>
          ) : (
            <div className="customer-form">
              <h4>Customer Details</h4>
              <div className="customer-form-grid">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="10 digit number"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Region</label>
                  <select
                    value={formData.customerRegion}
                    onChange={(e) => setFormData({ ...formData, customerRegion: e.target.value })}
                  >
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setShowForm(false)}>
                  ← Back
                </button>
                <button
                  className="submit-order-btn"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Place Order 🎉'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className={`order-result ${result.success ? 'success' : 'error'}`}>
          <span>{result.success ? '✅' : '❌'}</span>
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
};

export default QuickOrder;
