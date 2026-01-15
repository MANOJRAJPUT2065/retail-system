const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const salesRoutes = require('./routes/sales');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const salesService = require('./services/salesService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow all origins in production (you can restrict this later)
    callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales';

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err?.message || err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/sales', salesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

// Alias route: provide dashboard stats at /api/dashboard/stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const stats = await salesService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats (alias):', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbState = stateMap[mongoose.connection.readyState] || 'unknown';
  res.json({ status: 'OK', port: PORT, db: dbState });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

