import { useState, useEffect } from 'react';
import salesAPI from '../services/api';
import '../styles/SalesTrends.css';

export default function SalesTrendsPage() {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly'); // daily, weekly, monthly, yearly
  const [selectedMetric, setSelectedMetric] = useState('revenue'); // revenue, orders, avgOrderValue

  useEffect(() => {
    fetchTrends();
  }, [timeframe]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getSalesTrends(timeframe);
      setTrends(response.data);
    } catch (err) {
      console.error('Error loading trends:', err);
      setTrends(null);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!trends || !trends.data) return [];
    return trends.data;
  };

  const getMaxValue = () => {
    const data = getChartData();
    if (!data.length) return 0;
    return Math.max(...data.map(item => {
      if (selectedMetric === 'revenue') return item.revenue || 0;
      if (selectedMetric === 'orders') return item.orderCount || 0;
      return item.avgOrderValue || 0;
    }));
  };

  const getBarHeight = (value, maxValue) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  };

  const stats = trends ? {
    totalRevenue: trends.summary?.totalRevenue || 0,
    totalOrders: trends.summary?.totalOrders || 0,
    avgOrderValue: trends.summary?.avgOrderValue || 0,
    growth: trends.summary?.growth || 0
  } : { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, growth: 0 };

  const chartData = getChartData();
  const maxValue = getMaxValue();

  return (
    <div className="sales-trends-page">
      <h1>📈 Sales Trends & Analytics</h1>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card orders">
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card avg">
          <div className="stat-value">${stats.avgOrderValue.toFixed(2)}</div>
          <div className="stat-label">Avg Order Value</div>
        </div>
        <div className={`stat-card growth ${stats.growth >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-value">{stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(1)}%</div>
          <div className="stat-label">Growth</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="control-group">
          <label>Timeframe:</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="daily">📅 Daily</option>
            <option value="weekly">📊 Weekly</option>
            <option value="monthly">📈 Monthly</option>
            <option value="yearly">📆 Yearly</option>
          </select>
        </div>

        <div className="control-group">
          <label>Metric:</label>
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
            <option value="revenue">💰 Revenue</option>
            <option value="orders">📦 Orders</option>
            <option value="avgOrderValue">💵 Avg Order Value</option>
          </select>
        </div>
      </div>

      {loading && <p className="loading">Loading trends...</p>}

      {!loading && chartData.length === 0 && (
        <p className="no-data">No data available for this timeframe</p>
      )}

      {!loading && chartData.length > 0 && (
        <div className="chart-section">
          <h3>
            {selectedMetric === 'revenue' && '💰 Revenue Trend'}
            {selectedMetric === 'orders' && '📦 Orders Trend'}
            {selectedMetric === 'avgOrderValue' && '💵 Average Order Value Trend'}
          </h3>

          <div className="bar-chart">
            {chartData.map((item, idx) => {
              const value = selectedMetric === 'revenue' ? item.revenue || 0
                          : selectedMetric === 'orders' ? item.orderCount || 0
                          : item.avgOrderValue || 0;

              const displayLabel = timeframe === 'daily' ? item.date?.substring(5) // MM-DD
                                 : timeframe === 'weekly' ? `Week ${item.week}`
                                 : timeframe === 'monthly' ? item.month || item.date?.substring(5)
                                 : item.year;

              return (
                <div key={idx} className="bar-item">
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{ height: `${getBarHeight(value, maxValue)}%` }}
                    >
                      <span className="bar-value">
                        {selectedMetric === 'revenue' ? `$${value.toFixed(0)}` : value}
                      </span>
                    </div>
                  </div>
                  <div className="bar-label">{displayLabel}</div>
                </div>
              );
            })}
          </div>

          <div className="metrics-table">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Avg Order Value</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, idx) => {
                  const prevItem = idx > 0 ? chartData[idx - 1] : null;
                  const growth = prevItem
                    ? (((item.revenue - prevItem.revenue) / prevItem.revenue) * 100)
                    : 0;

                  const label = timeframe === 'daily' ? item.date
                              : timeframe === 'weekly' ? `Week ${item.week}`
                              : timeframe === 'monthly' ? item.month || item.date
                              : item.year;

                  return (
                    <tr key={idx}>
                      <td>{label}</td>
                      <td className="revenue">${(item.revenue || 0).toFixed(2)}</td>
                      <td className="orders">{item.orderCount || 0}</td>
                      <td className="avg">${(item.avgOrderValue || 0).toFixed(2)}</td>
                      <td className={`growth ${growth >= 0 ? 'positive' : 'negative'}`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="insights">
            <h4>📊 Key Insights</h4>
            <div className="insights-grid">
              <div className="insight-card">
                <span className="insight-label">Peak Revenue:</span>
                <span className="insight-value">
                  ${Math.max(...chartData.map(d => d.revenue || 0)).toFixed(2)}
                </span>
              </div>
              <div className="insight-card">
                <span className="insight-label">Most Orders:</span>
                <span className="insight-value">
                  {Math.max(...chartData.map(d => d.orderCount || 0))}
                </span>
              </div>
              <div className="insight-card">
                <span className="insight-label">Avg Revenue:</span>
                <span className="insight-value">
                  ${(chartData.reduce((sum, d) => sum + (d.revenue || 0), 0) / chartData.length).toFixed(2)}
                </span>
              </div>
              <div className="insight-card">
                <span className="insight-label">Periods Analyzed:</span>
                <span className="insight-value">{chartData.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
