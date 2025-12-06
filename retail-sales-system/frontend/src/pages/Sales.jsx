import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  FiDownload
} from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

const Sales = () => {
  // State for search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    dateRange: { from: '', to: '' },
    minAmount: '',
    maxAmount: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Fetch sales data with query parameters
  const fetchSales = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy: `${sortConfig.key}:${sortConfig.direction}`,
      ...(searchQuery && { q: searchQuery }),
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
      ...(filters.dateRange.from && { startDate: filters.dateRange.from }),
      ...(filters.dateRange.to && { endDate: filters.dateRange.to }),
      ...(filters.minAmount && { minAmount: filters.minAmount }),
      ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
    };

    const data = await api.getSales(params);
    return data;
  }, [currentPage, sortConfig, searchQuery, filters]);

  // Use React Query to fetch and cache sales data
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['sales', { currentPage, sortConfig, searchQuery, filters }],
    fetchSales,
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

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
    if (selectedRows.size === data?.data?.length) {
      setSelectedRows(new Set());
    } else {
      const allIds = data?.data?.map((sale) => sale._id) || [];
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

  // Handle date range changes
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [name]: value,
      },
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      dateRange: { from: '', to: '' },
      minAmount: '',
      maxAmount: '',
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
          checked={selectedRows.size > 0 && selectedRows.size === data?.data?.length}
          onChange={toggleSelectAll}
        />
      ),
      render: (sale) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={selectedRows.has(sale._id)}
          onChange={() => toggleRowSelection(sale._id)}
        />
      ),
      width: 'w-10',
    },
    {
      key: 'orderId',
      header: 'Order ID',
      sortable: true,
      render: (sale) => `#${sale._id.slice(-6).toUpperCase()}`,
      width: 'w-32',
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (sale) => format(new Date(sale.date), 'MMM d, yyyy'),
      width: 'w-32',
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: (sale) => sale.customer?.name || 'N/A',
      width: 'w-48',
    },
    {
      key: 'product',
      header: 'Product',
      render: (sale) => sale.product?.name || 'N/A',
      width: 'w-48',
    },
    {
      key: 'quantity',
      header: 'Qty',
      sortable: true,
      render: (sale) => sale.quantity,
      width: 'w-20',
      align: 'text-right',
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (sale) => formatCurrency(sale.finalAmount),
      width: 'w-32',
      align: 'text-right',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (sale) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            sale.status === 'Completed'
              ? 'bg-green-100 text-green-800'
              : sale.status === 'Processing'
              ? 'bg-blue-100 text-blue-800'
              : sale.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {sale.status}
        </span>
      ),
      width: 'w-32',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (sale) => (
        <div className="flex space-x-2">
          <button
            className="text-indigo-600 hover:text-indigo-900"
            onClick={() => handleEdit(sale._id)}
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDelete(sale._id)}
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
    console.log('Edit sale:', id);
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await api.deleteSale(id);
        refetch();
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Failed to delete sale. Please try again.');
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.size} selected sales?`)) {
      try {
        // In a real app, you might want to implement a bulk delete endpoint
        // For now, we'll delete them one by one
        const deletePromises = Array.from(selectedRows).map((id) =>
          api.deleteSale(id).catch((e) => {
            console.error(`Error deleting sale ${id}:`, e);
            return null;
          })
        );
        
        await Promise.all(deletePromises);
        setSelectedRows(new Set());
        refetch();
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('An error occurred while deleting sales. Some items may not have been deleted.');
      }
    }
  };

  // Handle export
  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting data...');
    // In a real app, you might want to generate a CSV or PDF
    alert('Export functionality would be implemented here');
  };

  // Loading state
  if (isLoading && !data) {
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
              {error?.message || 'An error occurred while loading sales data. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data?.data?.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery || Object.values(filters).some(Boolean)
            ? 'Try adjusting your search or filter criteria.'
            : 'Get started by creating a new sale.'}
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your sales transactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            New Sale
          </button>
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
                placeholder="Search sales..."
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
              {Object.values(filters).some((value) => 
                typeof value === 'object' 
                  ? Object.values(value).some(Boolean)
                  : Boolean(value)
              ) && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-4 text-white bg-indigo-600 rounded-full">
                  {Object.values(filters).reduce((count, value) => {
                    if (typeof value === 'object') {
                      return count + Object.values(value).filter(Boolean).length;
                    }
                    return count + (value ? 1 : 0);
                  }, 0)}
                </span>
              )}
            </button>

            {(searchQuery || Object.values(filters).some((value) => 
              typeof value === 'object' 
                ? Object.values(value).some(Boolean)
                : Boolean(value)
            )) && (
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
              {/* Status filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              {/* Payment method filter */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.paymentMethod}
                  onChange={handleFilterChange}
                >
                  <option value="">All Methods</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              {/* Date range filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="date"
                      name="from"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={filters.dateRange.from}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      name="to"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={filters.dateRange.to}
                      onChange={handleDateRangeChange}
                      min={filters.dateRange.from}
                    />
                  </div>
                </div>
              </div>

              {/* Amount range filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      name="minAmount"
                      placeholder="Min"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={filters.minAmount}
                      onChange={handleFilterChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="maxAmount"
                      placeholder="Max"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={filters.maxAmount}
                      onChange={handleFilterChange}
                      min={filters.minAmount || '0'}
                      step="0.01"
                    />
                  </div>
                </div>
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
```
