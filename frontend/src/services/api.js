import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const salesAPI = {
  getSales: async (params) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getFilterOptions: async () => {
    const response = await api.get('/sales/filters');
    return response.data;
  },
};

export default api;

