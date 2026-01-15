import axios from 'axios';

// Prefer localhost during dev regardless of env, unless env explicitly points to localhost
const envBase = (import.meta.env.VITE_API_URL || '').trim();
const isLocalHost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
);
const fallbackProd = 'https://retail-system-production-d4d7.up.railway.app/api';
const fallbackDev = 'http://localhost:5000/api';
const envIsLocal = /localhost|127\.0\.0\.1/.test(envBase);
const API_BASE_URL = isLocalHost
  ? (envIsLocal ? envBase : fallbackDev)
  : (envBase || fallbackProd);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const salesAPI = {
  getSales: async (pageOrParams, limit, filters) => {
    // Support both old (page, limit, filters) and new (params object) calling styles
    let params;
    if (typeof pageOrParams === 'object') {
      params = pageOrParams;
    } else {
      params = { page: pageOrParams, limit, ...filters };
    }
    
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getFilterOptions: async () => {
    const response = await api.get('/sales/filters');
    return response.data;
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/sales/dashboard/stats');
      return response.data;
    } catch (err) {
      // Fallback for backends exposing alias route
      const fallback = await api.get('/dashboard/stats');
      return fallback.data;
    }
  },

  uploadCSV: async (formData) => {
    const response = await api.post('/sales/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createQuickOrder: async (orderData) => {
    const response = await api.post('/sales/quick-order', orderData);
    return response.data;
  },

  exportSalesCSV: async (filters) => {
    const response = await api.get('/sales/export/csv', { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  bulkDeleteSales: async (saleIds) => {
    const response = await api.delete('/sales/bulk-delete', {
      data: { saleIds }
    });
    return response.data;
  },

  getInventory: async () => {
    const response = await api.get('/products/inventory');
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getOrderHistory: async () => {
    const response = await api.get('/orders/history');
    return response.data;
  },

  getOrderHistoryFiltered: async (params) => {
    const response = await api.get('/orders/history', { params });
    return response.data;
  },

  getSalesTrends: async (timeframe, params = {}) => {
    const response = await api.get('/sales/trends', {
      params: { timeframe, ...params }
    });
    return response.data;
  },
};

export default api;

