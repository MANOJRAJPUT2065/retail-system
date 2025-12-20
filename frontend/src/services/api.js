import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const response = await api.get('/sales/dashboard/stats');
    return response.data;
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

  getSalesTrends: async (timeframe) => {
    const response = await api.get('/sales/trends', {
      params: { timeframe }
    });
    return response.data;
  },
};

export default api;

