import { useState, useEffect } from 'react';
import { salesAPI } from '../services/api';
import '../styles/SalesTrends.css';

export default function SalesTrendsPage() {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [smoothingType, setSmoothingType] = useState('movingAverage'); // none | movingAverage | expSmoothing
  const [windowSize, setWindowSize] = useState(3);
  const [alpha, setAlpha] = useState(0.3);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showSmoothed, setShowSmoothed] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    fetchTrends();
  }, [timeframe, dateFrom, dateTo]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const params = { timeframe };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const data = await salesAPI.getSalesTrends(timeframe, params);
      setTrends(data);
    } catch (err) {
      console.error('Error loading trends:', err);
      setTrends(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (filter) => {
    setQuickFilter(filter);
    const today = new Date();
    const from = new Date();
    
    switch(filter) {
      case 'last7days':
        from.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        from.setDate(today.getDate() - 30);
        break;
      case 'last3months':
        from.setMonth(today.getMonth() - 3);
        break;
      case 'last6months':
        from.setMonth(today.getMonth() - 6);
        break;
      case 'thisYear':
        from.setMonth(0);
        from.setDate(1);
        break;
      case 'all':
      default:
        setDateFrom('');
        setDateTo('');
        return;
    }
    
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  const getChartData = () => {
    if (!trends || !trends.data) return [];
    return trends.data;
  };

  const getMetricValue = (item) => (
    selectedMetric === 'revenue' ? (item.revenue || 0)
    : selectedMetric === 'orders' ? (item.orderCount || 0)
    : (item.avgOrderValue || 0)
  );

  const movingAverage = (values, n) => {
    if (n <= 1) return values.slice();
    const result = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= n) sum -= values[i - n];
      result.push(i >= n - 1 ? sum / n : values[i]);
    }
    return result;
  };

  const expSmoothing = (values, a) => {
    if (values.length === 0) return [];
    const result = [values[0]];
    for (let i = 1; i < values.length; i++) {
      result.push(a * values[i] + (1 - a) * result[i - 1]);
    }
    return result;
  };

  const computeSmoothed = (values) => {
    if (smoothingType === 'movingAverage') return movingAverage(values, windowSize);
    if (smoothingType === 'expSmoothing') return expSmoothing(values, alpha);
    return values.slice();
  };

  const generateLinePathForValues = (values) => {
    const data = getChartData();
    if (data.length === 0 || values.length === 0) return null;

    const width = 900;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...values);
    if (maxValue === 0) return null;

    const points = values.map((value, idx) => {
      const x = padding.left + (idx / Math.max(values.length - 1, 1)) * chartWidth;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      return { x, y, value, item: data[idx], idx };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return { pathData, points, maxValue, width, height, padding, chartWidth, chartHeight };
  };

  const detectAnomalies = (values, baseline, sigma = 2) => {
    if (!baseline || baseline.length !== values.length) return [];
    const residuals = values.map((v, i) => v - baseline[i]);
    const mean = residuals.reduce((s, r) => s + r, 0) / residuals.length;
    const variance = residuals.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / residuals.length;
    const std = Math.sqrt(variance) || 0;
    return residuals.map((r) => Math.abs(r - mean) > sigma * std);
  };

  const generateLinePath = () => {
    const data = getChartData();
    if (data.length === 0) return null;

    const width = 900;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(item => {
      if (selectedMetric === 'revenue') return item.revenue || 0;
      if (selectedMetric === 'orders') return item.orderCount || 0;
      return item.avgOrderValue || 0;
    }));

    if (maxValue === 0) return null;

    const points = data.map((item, idx) => {
      const value = selectedMetric === 'revenue' ? item.revenue || 0
                  : selectedMetric === 'orders' ? item.orderCount || 0
                  : item.avgOrderValue || 0;
      
      const x = padding.left + (idx / Math.max(data.length - 1, 1)) * chartWidth;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      
      return { x, y, value, item, idx };
    });

    const pathData = points.map((point, idx) => 
      `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return { pathData, points, maxValue, width, height, padding, chartWidth, chartHeight };
  };

  const stats = trends ? {
    totalRevenue: trends.summary?.totalRevenue || 0,
    totalOrders: trends.summary?.totalOrders || 0,
    avgOrderValue: trends.summary?.avgOrderValue || 0,
    growth: trends.summary?.growth || 0
  } : { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, growth: 0 };

  const chartData = getChartData();

  return (
    <div className="sales-trends-page">
      <h1>📈 Sales Trends & Analytics</h1>

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

      <div className="quick-filters">
        <button 
          className={`quick-filter-btn ${quickFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('all')}
        >
          All Time
        </button>
        <button 
          className={`quick-filter-btn ${quickFilter === 'last7days' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('last7days')}
        >
          Last 7 Days
        </button>
        <button 
          className={`quick-filter-btn ${quickFilter === 'last30days' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('last30days')}
        >
          Last 30 Days
        </button>
        <button 
          className={`quick-filter-btn ${quickFilter === 'last3months' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('last3months')}
        >
          Last 3 Months
        </button>
        <button 
          className={`quick-filter-btn ${quickFilter === 'last6months' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('last6months')}
        >
          Last 6 Months
        </button>
        <button 
          className={`quick-filter-btn ${quickFilter === 'thisYear' ? 'active' : ''}`}
          onClick={() => handleQuickFilter('thisYear')}
        >
          This Year
        </button>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <label>From Date:</label>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={(e) => { setDateFrom(e.target.value); setQuickFilter('custom'); }}
            className="date-input"
          />
        </div>

        <div className="control-group">
          <label>To Date:</label>
          <input 
            type="date" 
            value={dateTo} 
            onChange={(e) => { setDateTo(e.target.value); setQuickFilter('custom'); }}
            className="date-input"
          />
        </div>

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

        <div className="control-group">
          <label>Smoothing:</label>
          <select value={smoothingType} onChange={(e) => setSmoothingType(e.target.value)}>
            <option value="none">None</option>
            <option value="movingAverage">Moving Average</option>
            <option value="expSmoothing">Exponential Smoothing</option>
          </select>
        </div>

        {smoothingType === 'movingAverage' && (
          <div className="control-group">
            <label>Window Size:</label>
            <input
              type="number"
              min="2"
              max="12"
              value={windowSize}
              onChange={(e) => setWindowSize(parseInt(e.target.value) || 3)}
              className="date-input"
            />
          </div>
        )}

        {smoothingType === 'expSmoothing' && (
          <div className="control-group">
            <label>Alpha (0-1):</label>
            <input
              type="number"
              step="0.05"
              min="0.05"
              max="0.95"
              value={alpha}
              onChange={(e) => setAlpha(Math.min(0.95, Math.max(0.05, parseFloat(e.target.value) || 0.3)))}
              className="date-input"
            />
          </div>
        )}

        <div className="control-group">
          <label>Series:</label>
          <div className="toggle-row">
            <label><input type="checkbox" checked={showOriginal} onChange={(e) => setShowOriginal(e.target.checked)} /> Original</label>
            <label><input type="checkbox" checked={showSmoothed} onChange={(e) => setShowSmoothed(e.target.checked)} /> Smoothed</label>
            <label><input type="checkbox" checked={showAnomalies} onChange={(e) => setShowAnomalies(e.target.checked)} /> Anomalies</label>
          </div>
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

          <div className="line-chart">
            {(() => {
              const data = getChartData();
              const values = data.map(getMetricValue);
              const smoothed = computeSmoothed(values);
              const anomalies = detectAnomalies(values, smoothed, 2);

              const rawLine = showOriginal ? generateLinePathForValues(values) : null;
              const smoothLine = showSmoothed ? generateLinePathForValues(smoothed) : null;
              const baseLine = rawLine || smoothLine;
              if (!baseLine) return <p>No data to display</p>;

              const { width, height, padding, chartWidth, chartHeight } = baseLine;
              const yMax = Math.max(rawLine?.maxValue ?? 0, smoothLine?.maxValue ?? 0);
              if (!yMax || yMax === 0) return <p>No data to display</p>;

              const yAxisSteps = 5;
              const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
                const value = (yMax / yAxisSteps) * (yAxisSteps - i);
                return {
                  y: padding.top + (i / yAxisSteps) * chartHeight,
                  value: selectedMetric === 'revenue' ? `$${value.toFixed(0)}` : value.toFixed(0)
                };
              });

              return (
                <svg width={width} height={height} className="line-chart-svg">
                  {yAxisLabels.map((label, idx) => (
                    <line
                      key={`grid-${idx}`}
                      x1={padding.left}
                      y1={label.y}
                      x2={width - padding.right}
                      y2={label.y}
                      stroke="#e0e0e0"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  ))}

                  {yAxisLabels.map((label, idx) => (
                    <text
                      key={`ylabel-${idx}`}
                      x={padding.left - 10}
                      y={label.y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill="#666"
                    >
                      {label.value}
                    </text>
                  ))}

                  <line
                    x1={padding.left}
                    y1={height - padding.bottom}
                    x2={width - padding.right}
                    y2={height - padding.bottom}
                    stroke="#333"
                    strokeWidth="2"
                  />

                  <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={height - padding.bottom}
                    stroke="#333"
                    strokeWidth="2"
                  />

                  {rawLine && (
                    <path
                      d={rawLine.pathData}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {smoothLine && (
                    <path
                      d={smoothLine.pathData}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>

                  {(rawLine?.points || smoothLine?.points || []).map((point, idx) => {
                    const xLabel = timeframe === 'daily' ? point.item.date?.substring(5)
                                  : timeframe === 'weekly' ? `W${point.item.week}`
                                  : timeframe === 'monthly' ? point.item.month?.substring(5) || point.item.date?.substring(5)
                                  : point.item.year;
                    const value = values[idx];
                    const sVal = smoothed[idx];
                    const isAnomaly = showAnomalies && anomalies[idx];
                    const yPos = rawLine ? rawLine.points[idx].y : smoothLine.points[idx].y;
                    return (
                      <g key={`point-${idx}`} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
                        <circle
                          cx={point.x}
                          cy={yPos}
                          r={isAnomaly ? 6 : 4}
                          fill="#fff"
                          stroke={isAnomaly ? '#ef4444' : '#6366f1'}
                          strokeWidth={isAnomaly ? 2.5 : 2}
                          className="data-point"
                        />

                        <text
                          x={point.x}
                          y={height - padding.bottom + 20}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#666"
                        >
                          {xLabel}
                        </text>

                        {hoveredIdx === idx && (
                          <g>
                            <rect x={point.x + 8} y={yPos - 40} rx="6" ry="6" width="160" height="60" fill="#ffffff" stroke="#e5e7eb" />
                            <text x={point.x + 16} y={yPos - 20} fontSize="12" fill="#111827">{xLabel}</text>
                            <text x={point.x + 16} y={yPos - 6} fontSize="12" fill="#6b7280">Raw: {selectedMetric === 'revenue' ? `$${value.toFixed(0)}` : value.toFixed(0)}</text>
                            <text x={point.x + 16} y={yPos + 8} fontSize="12" fill="#10b981">Smoothed: {selectedMetric === 'revenue' ? `$${sVal.toFixed(0)}` : sVal.toFixed(0)}</text>
                            {isAnomaly && <text x={point.x + 16} y={yPos + 22} fontSize="12" fill="#ef4444">Anomaly</text>}
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
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
