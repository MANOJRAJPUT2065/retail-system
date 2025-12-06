import axios from 'axios';

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors (401, 403, 404, 500, etc.)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        console.error('Unauthorized access - please log in');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (status === 403) {
        // Handle forbidden access
        console.error('You do not have permission to access this resource');
      } else if (status === 404) {
        // Handle not found
        console.error('The requested resource was not found');
      } else if (status >= 500) {
        // Handle server errors
        console.error('A server error occurred. Please try again later.');
      }
      
      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        errors: data?.errors,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.',
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      return Promise.reject({
        message: 'Error setting up request. Please try again.',
      });
    }
  }
);

// API methods for sales
const salesApi = {
  getSales: (params) => api.get('/sales', { params }),
  getSaleById: (id) => api.get(`/sales/${id}`),
  searchSales: (query, params) => api.get('/sales/search', { params: { q: query, ...params } }),
  getSalesStats: () => api.get('/sales/stats'),
  getFilterOptions: () => api.get('/sales/filters'),
  createSale: (data) => api.post('/sales', data),
  updateSale: (id, data) => api.put(`/sales/${id}`, data),
  deleteSale: (id) => api.delete(`/sales/${id}`),
};

// API methods for customers
const customersApi = {
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomerById: (id) => api.get(`/customers/${id}`),
  searchCustomers: (query, params) => api.get('/customers/search', { params: { q: query, ...params } }),
  getCustomerStats: () => api.get('/customers/stats'),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

// API methods for products
const productsApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  searchProducts: (query, params) => api.get('/products/search', { params: { q: query, ...params } }),
  getProductStats: () => api.get('/products/stats'),
  getCategories: () => api.get('/products/categories'),
  getBrands: () => api.get('/products/brands'),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// API methods for authentication (if needed)
const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
};

// Export all API methods
export default {
  ...salesApi,
  ...customersApi,
  ...productsApi,
  ...authApi,
  // Export the axios instance in case it's needed directly
  _axios: api,
};
