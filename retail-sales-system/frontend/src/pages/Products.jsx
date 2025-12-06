// frontend/src/pages/Products.jsx
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiChevronDown, 
  FiChevronUp, 
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiBox,
  FiLoader
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

const Products = () => {
  const queryClient = useQueryClient();
  
  // State for search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    inStock: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // Query keys
  const productsQueryKey = [
    'products', 
    { 
      page: currentPage, 
      sortBy: `${sortConfig.key}:${sortConfig.direction}`,
      ...filters,
      search: searchQuery 
    }
  ];

  // Fetch products data with query parameters
  const fetchProducts = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy: `${sortConfig.key}:${sortConfig.direction}`,
      ...(searchQuery && { q: searchQuery }),
      ...(filters.category && { category: filters.category }),
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.inStock && { inStock: filters.inStock === 'true' }),
    };

    return await api.getProducts(params);
  }, [currentPage, sortConfig, searchQuery, filters]);

  // Use React Query to fetch and cache products data
  const { 
    data: productsData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories and brands for filters
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: api.getBrands,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(productsQueryKey);
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
  
  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map(id => 
        api.deleteProduct(id).catch(e => {
          console.error(`Failed to delete product ${id}:`, e);
          return null;
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      setSelectedRows(new Set());
      queryClient.invalidateQueries(productsQueryKey);
      toast.success('Selected products deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete some products');
    },
  });

  // Reset to first page when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle row selection
  const toggleRowSelection = (id) => {
    const newSelection = new Set(selectedRows);
    if (selectedRows.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  // Handle select all rows
  const toggleSelectAll = () => {
    if (selectedRows.size === productsData?.data?.length) {
      setSelectedRows(new Set());
    } else {
      const allIds = productsData?.data?.map((product) => product._id) || [];
      setSelectedRows(new Set(allIds));
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
    });
    setSearchQuery('');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />;
  };

  // Table columns configuration
  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={selectedRows.size > 0 && selectedRows.size === productsData?.data?.length}
          onChange={toggleSelectAll}
        />
      ),
      render: (product) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={selectedRows.has(product._id)}
          onChange={() => toggleRowSelection(product._id)}
        />
      ),
      width: 'w-10',
    },
    {
      key: 'image',
      header: '',
      render: (product) => (
        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
          {product.imageUrl ? (
            <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
          ) : (
            <FiPackage className="h-6 w-6 text-gray-400" />
          )}
        </div>
      ),
      width: 'w-12',
    },
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (product) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">{product.sku}</div>
        </div>
      ),
      width: 'w-64',
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (product) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {product.category}
        </span>
      ),
      width: 'w-32',
    },
    {
      key: 'brand',
      header: 'Brand',
      sortable: true,
      render: (product) => product.brand || 'N/A',
      width: 'w-32',
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (product) => formatCurrency(product.price),
      width: 'w-24',
      align: 'text-right',
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (product) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                product.stockQuantity > 20 ? 'bg-green-600' : product.stockQuantity > 5 ? 'bg-yellow-500' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(100, (product.stockQuantity / (product.stockQuantity + 20)) * 100)}%` }}
            ></div>
          </div>
          <span className="ml-2 text-sm text-gray-600 w-8 text-right">
            {product.stockQuantity}
          </span>
        </div>
      ),
      width: 'w-48',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (product) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : product.status === 'Draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {product.status}
        </span>
      ),
      width: 'w-24',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div className="flex space-x-2">
          <button
            className="text-indigo-600 hover:text-indigo-900"
            onClick={() => handleEdit(product._id)}
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDelete(product._id)}
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      width: 'w-20',
    },
  ];

  // Handle edit action
  const handleEdit = (id) => {
    // Implement edit functionality
    console.log('Edit product:', id);
  };

  // Handle delete action
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.size} selected products?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedRows));
    }
  };

  // Handle export
  const handleExport = () => {
    // In a real app, you would generate a CSV/Excel file or call an export API
    toast.info('Export functionality will be implemented soon');
  };

  // Loading state
  if (isLoading && !productsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error?.message || 'An error occurred while loading products. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (productsData?.data?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <FiPackage className="h-full w-full" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery || Object.values(filters).some(Boolean)
            ? 'Try adjusting your search or filter criteria.'
            : 'Get started by adding a new product.'}
        </p>
        <div className="mt-6">
          <Link
            to="/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            New Product
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            New Product
          </Link>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md h-10"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <FiX className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Filter button */}
          <div className="flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter className="-ml-0.5 mr-2 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Filters'}
              {Object.values(filters).some(Boolean) && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-4 text-white bg-indigo-600 rounded-full">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>

            {(searchQuery || Object.values(filters).some(Boolean)) && (
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={clearFilters}
              >
                <FiX className="-ml-0.5 mr-1 h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand filter */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  id="brand"
                  name="brand"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.brand}
                  onChange={handleFilterChange}
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 sm:text-sm border-gray-300 rounded-md h-10"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 sm:text-sm border-gray-300 rounded-md h-10"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        min={filters.minPrice || '0'}
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock status filter */}
              <div>
                <label htmlFor="inStock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Status
                </label>
                <select
                  id="inStock"
                  name="inStock"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.inStock}
                  onChange={handleFilterChange}
                >
                  <option value="">All Products</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selectedRows.size > 0 && (
        <div className="bg-indigo-50 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-indigo-900">
              {selectedRows.size} selected
            </span>
          </div>
          <div className="space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleBulkDelete}
            >
              <FiTrash2 className="-ml-1 mr-1 h-3 w-3" />
              Delete
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleExport}
            >
              <FiDownload className="-ml-1 mr-1 h-3 w-3" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.width || ''
                    } ${column.align || 'text-left'}`}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="group inline-flex items-center"
                        onClick={() => requestSort(column.key)}
                      >
                        {column.header}
                        {getSortIndicator(column.key)}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <FiLoader className="animate-spin h-5 w-5 text-indigo-600 mr-2" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : productsData?.data?.length > 0 ? (
                productsData.data.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={`${product._id}-${column.key}`}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${column.align || 'text-left'}`}
                      >
                        {column.render(product)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!productsData?.hasNextPage || isLoading}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                !productsData?.hasNextPage || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">
                  {productsData?.data?.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                </span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, productsData?.total || 0)}
                </span>{' '}
                of <span className="font-medium">{productsData?.total || 0}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 || isLoading
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {(() => {
                  const totalPages = Math.ceil((productsData?.total || 0) / ITEMS_PER_PAGE);
                  const maxVisiblePages = 5;
                  const pages = [];
                  
                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if total pages is less than or equal to maxVisiblePages
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Show first page, current page, last page, and ellipsis
                    const leftBound = Math.max(1, currentPage - 1);
                    const rightBound = Math.min(totalPages, currentPage + 1);
                    
                    // Always show first page
                    pages.push(1);
                    
                    // Add ellipsis if needed
                    if (leftBound > 2) {
                      pages.push('...');
                    }
                    
                    // Add pages around current page
                    for (let i = Math.max(2, leftBound); i <= Math.min(totalPages - 1, rightBound); i++) {
                      if (!pages.includes(i)) {
                        pages.push(i);
                      }
                    }
                    
                    // Add ellipsis if needed
                    if (rightBound < totalPages - 1) {
                      pages.push('...');
                    }
                    
                    // Always show last page
                      pages.push(totalPages);
                  }
                  
                  return pages.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span 
                          key={`ellipsis-${index}`}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                        disabled={isLoading}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
                
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!productsData?.hasNextPage || isLoading}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    !productsData?.hasNextPage || isLoading
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;