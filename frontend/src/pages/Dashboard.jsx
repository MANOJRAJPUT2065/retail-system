import { useState, useEffect } from 'react';
import { salesAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    growths: {
      sales: 0,
      revenue: 0,
      orders: 0,
      avgOrder: 0
    }
  });

  const [weeklyData, setWeeklyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getDashboardStats();
      
      setStats(data.stats);
      setWeeklyData(data.weeklyStats);
      setTopProducts(data.topProducts);
      setRegionData(data.regionStats);
      setRecentActivity(data.recentActivity);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getDayLabel = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getMaxSales = () => {
    if (weeklyData.length === 0) return 1;
    return Math.max(...weeklyData.map(d => d.sales));
  };

  const calculatePercentage = (sales) => {
    const max = getMaxSales();
    return max > 0 ? (sales / max) * 100 : 0;
  };

  const getActivityIcon = (action) => {
    if (action.includes('purchased')) return '🛍️';
    if (action.includes('payment')) return '💳';
    if (action.includes('product')) return '📦';
    if (action.includes('customer')) return '👤';
    return '🚚';
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales.toLocaleString('en-IN')}`,
      icon: '💰',
      color: '#667eea',
      growth: `${stats.growths.sales >= 0 ? '+' : ''}${stats.growths.sales}%`
    },
    {
      title: 'Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: '📈',
      color: '#764ba2',
      growth: `${stats.growths.revenue >= 0 ? '+' : ''}${stats.growths.revenue}%`
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString('en-IN'),
      icon: '🛒',
      color: '#f093fb',
      growth: `${stats.growths.orders >= 0 ? '+' : ''}${stats.growths.orders}%`
    },
    {
      title: 'Avg Order Value',
      value: `₹${stats.avgOrderValue.toLocaleString('en-IN')}`,
      icon: '💳',
      color: '#4facfe',
      growth: `${stats.growths.avgOrder >= 0 ? '+' : ''}${stats.growths.avgOrder}%`
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-loading">
        <div className="error-message">{error}</div>
        <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-icon" style={{ background: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-growth positive">{stat.growth}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Sales Chart */}
        <div className="dashboard-card chart-card">
          <h2>Sales Overview (Last 7 Days)</h2>
          <div className="chart-container">
            <div className="bar-chart">
              {weeklyData.length > 0 ? weeklyData.map((day, index) => {
                const height = calculatePercentage(day.sales);
                return (
                  <div key={index} className="bar-wrapper">
                    <div 
                      className="bar" 
                      style={{ 
                        height: `${height}%`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="bar-value">₹{(day.sales / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="bar-label">{getDayLabel(day.date)}</div>
                  </div>
                );
              }) : (
                <div className="no-data">No sales data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="dashboard-card">
          <h2>Top Products</h2>
          <div className="top-products">
            {topProducts.length > 0 ? topProducts.map((product, index) => {
              const maxSales = Math.max(...topProducts.map(p => p.sales));
              const percentage = maxSales > 0 ? (product.sales / maxSales) * 100 : 0;
              return (
                <div 
                  key={index} 
                  className="product-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-sales">₹{(product.sales / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <div className="no-data">No product data available</div>
            )}
          </div>
        </div>

        {/* Sales by Region */}
        <div className="dashboard-card">
          <h2>Sales by Region</h2>
          <div className="region-chart">
            {regionData.length > 0 ? regionData.map((region, index) => {
              const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
              return (
                <div 
                  key={index} 
                  className="region-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="region-info">
                    <span className="region-name">{region.region}</span>
                    <span className="region-percentage">{region.percentage}%</span>
                  </div>
                  <div className="region-bar">
                    <div 
                      className="region-fill" 
                      style={{ 
                        width: `${region.percentage}%`,
                        background: colors[index % colors.length]
                      }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <div className="no-data">No region data available</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className="activity-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="activity-icon">{getActivityIcon(activity.action)}</span>
                <div className="activity-content">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-time">{formatTime(activity.time)}</div>
                </div>
              </div>
            )) : (
              <div className="no-data">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
