import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/products', label: 'Products', icon: '🛍️' },
    { path: '/orders', label: 'Orders', icon: '📋' },
    { path: '/trends', label: 'Trends', icon: '📊' },
    { path: '/tools', label: 'Tools', icon: '🛠️' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-icon">🛍️</span>
          <span className="brand-text">Retail System</span>
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
