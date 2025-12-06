// src/utils/jwt.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });

  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: '7d'
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};