// src/config/config.js
export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/retail-sales',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_development',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_development',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};