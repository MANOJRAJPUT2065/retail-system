import { useState, useEffect } from 'react';
import { salesAPI } from '../services/api';
import '../styles/Reports.css';

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (!stats) return <div className="error">Failed to load reports</div>;

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>📊 Sales Reports & Analytics</h1>
        <p>Comprehensive business insights and metrics</p>
      </div>

      <div className="reports-controls">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="overview">Overview Report</option>
          <option value="products">Top Products</option>
          <option value="regions">Regional Analysis</option>
          <option value="customers">Customer Insights</option>
        </select>

        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>

        <button className="export-btn" onClick={() => alert('Export feature coming soon!')}>
          📥 Export Report
        </button>
      </div>

      {reportType === 'overview' && (
        <div className="report-section">
          <h2>Monthly Overview</h2>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <h3>Total Revenue</h3>
                <p className="metric-value">₹{Math.round(stats.currentMonth?.totalRevenue || 0).toLocaleString('en-IN')}</p>
                <p className="metric-change">
                  {stats.currentMonth?.totalRevenue > stats.lastMonth?.totalRevenue 
                    ? '📈 Up from last month' 
                    : '📉 Down from last month'}
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📦</div>
              <div className="metric-content">
                <h3>Total Orders</h3>
                <p className="metric-value">{stats.currentMonth?.totalOrders || 0}</p>
                <p className="metric-detail">
                  Avg: ₹{Math.round((stats.currentMonth?.avgOrderValue) || 0).toLocaleString('en-IN')} per order
                </p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <h3>Total Sales</h3>
                <p className="metric-value">₹{Math.round(stats.currentMonth?.totalSales || 0).toLocaleString('en-IN')}</p>
                <p className="metric-detail">Before discounts</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <h3>Avg Order Value</h3>
                <p className="metric-value">₹{Math.round(stats.currentMonth?.avgOrderValue || 0).toLocaleString('en-IN')}</p>
                <p className="metric-detail">Customer value</p>
              </div>
            </div>
          </div>

          <div className="comparison-box">
            <h3>Month-to-Month Comparison</h3>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>This Month</th>
                  <th>Last Month</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Revenue</td>
                  <td>₹{Math.round(stats.currentMonth?.totalRevenue || 0).toLocaleString('en-IN')}</td>
                  <td>₹{Math.round(stats.lastMonth?.totalRevenue || 0).toLocaleString('en-IN')}</td>
                  <td className={stats.currentMonth?.totalRevenue > stats.lastMonth?.totalRevenue ? 'positive' : 'negative'}>
                    {Math.round(((stats.currentMonth?.totalRevenue || 0) - (stats.lastMonth?.totalRevenue || 0)) / (stats.lastMonth?.totalRevenue || 1) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td>Total Orders</td>
                  <td>{stats.currentMonth?.totalOrders || 0}</td>
                  <td>{stats.lastMonth?.totalOrders || 0}</td>
                  <td className={stats.currentMonth?.totalOrders > stats.lastMonth?.totalOrders ? 'positive' : 'negative'}>
                    {stats.currentMonth?.totalOrders - (stats.lastMonth?.totalOrders || 0)} orders
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'products' && (
        <div className="report-section">
          <h2>Top Selling Products</h2>
          <div className="products-list">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p>{product.count} units sold</p>
                  </div>
                  <div className="product-revenue">
                    ₹{Math.round(product.sales).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No product data available</p>
            )}
          </div>
        </div>
      )}

      {reportType === 'regions' && (
        <div className="report-section">
          <h2>Regional Performance</h2>
          <div className="regions-grid">
            {stats.regionStats && stats.regionStats.length > 0 ? (
              stats.regionStats.map((region, index) => (
                <div key={index} className="region-card">
                  <h3>{region.region}</h3>
                  <p className="region-value">₹{Math.round(region.value).toLocaleString('en-IN')}</p>
                  <div className="region-bar">
                    <div className="bar-fill" style={{width: `${region.percentage}%`}}></div>
                  </div>
                  <p className="region-percentage">{region.percentage}% of total</p>
                </div>
              ))
            ) : (
              <p className="no-data">No regional data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
