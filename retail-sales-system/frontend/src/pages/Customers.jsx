import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiChevronDown, 
  FiChevronUp, 
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

const Customers = () => {
  // State for search, filters, and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    region: '',
    customerType: '',
    minOrders: '',
    maxOrders: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Fetch customers data with query parameters
  const fetchCustomers = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy: `${sortConfig.key}:${sortConfig.direction}`,
      ...(searchQuery && { q: searchQuery }),
      ...(filters.status && { status: filters.status }),
      ...(filters.region && { region: filters.region }),
      ...(filters.customerType && { customerType: filters.customerType }),
      ...(filters.minOrders && { minOrders: filters.minOrders }),
      ...(filters.maxOrders && { maxOrders: filters.maxOrders }),
    };

    const data = await api.getCustomers(params);
    return data;
  }, [currentPage, sortConfig, searchQuery, filters]);

  // Use React Query to fetch and cache customers data
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['customers', { currentPage, sortConfig, searchQuery, filters }],
    fetchCustomers,
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
      const allIds = data?.data?.map((customer) => customer._id) || [];
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
      status: '',
      region: '',
      customerType: '',
      minOrders: '',
      maxOrders: '',
    });
    setSearchQuery('');
  };

  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
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
      render: (customer) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={selectedRows.has(customer._id)}
          onChange={() => toggleRowSelection(customer._id)}
        />
      ),
      width: 'w-10',
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (customer) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
            <div className="text-sm text-gray-500">{customer.email}</div>
          </div>
        </div>
      ),
      width: 'w-64',
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (customer) => (
        <div className="text-sm text-gray-900">
          <div className="flex items-center">
            <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
            {customer.phoneNumber || 'N/A'}
          </div>
          <div className="flex items-center mt-1">
            <FiMail className="mr-2 h-4 w-4 text-gray-400" />
            {customer.email || 'N/A'}
          </div>
        </div>
      ),
      width: 'w-48',
    },
    {
      key: 'location',
      header: 'Location',
      render: (customer) => (
        <div className="flex items-center text-sm text-gray-500">
          <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
          {customer.region || 'N/A'}
        </div>
      ),
      width: 'w-32',
    },
    {
      key: 'orders',
      header: 'Orders',
      sortable: true,
      render: (customer) => (
        <div className="text-sm text-gray-900">
          {customer.orderCount || 0} orders
        </div>
      ),
      width: 'w-24',
      align: 'text-center',
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      sortable: true,
      render: (customer) => (
        <div className="text-sm font-medium text-gray-900">
          ${(customer.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      ),
      width: 'w-32',
      align: 'text-right',
    },
    {
      key: 'lastOrder',
      header: 'Last Order',
      sortable: true,
      render: (customer) => (
        <div className="text-sm text-gray-500">
          {customer.lastOrder ? formatDate(customer.lastOrder) : 'N/A'}
        </div>
      ),
      width: 'w-32',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (customer) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            customer.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : customer.status === 'Inactive'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {customer.status || 'N/A'}
        </span>
      ),
      width: 'w-24',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (customer) => (
        <div className="flex space-x-2">
          <button
            className="text-indigo-600 hover:text-indigo-900"
            onClick={() => handleEdit(customer._id)}
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDelete(customer._id)}
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
    console.log('Edit customer:', id);
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.deleteCustomer(id);
        refetch();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.size} selected customers?`)) {
      try {
        const deletePromises = Array.from(selectedRows).map((id) =>
          api.deleteCustomer(id).catch((e) => {
            console.error(`Error deleting customer ${id}:`, e);
            return null;
          })
        );
        
        await Promise.all(deletePromises);
        setSelectedRows(new Set());
        refetch();
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('An error occurred while deleting customers. Some items may not have been deleted.');
      }
    }
  };

  // Handle export
  const handleExport = () => {
    console.log('Exporting customer data...');
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
              {error?.message || 'An error occurred while loading customers. Please try again.'}
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
        <div className="mx-auto h-24 w-24 text-gray-400">
          <FiUserPlus className="h-full w-full" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery || Object.values(filters).some(Boolean)
            ? 'Try adjusting your search or filter criteria.'
            : 'Get started by adding a new customer.'}
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiUserPlus className="-ml-1 mr-2 h-5 w-5" />
            New Customer
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
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your customer relationships
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiUserPlus className="-ml-1 mr-2 h-5 w-5" />
            New Customer
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
                placeholder="Search customers..."
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>

              {/* Region filter */}
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select
                  id="region"
                  name="region"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.region}
                  onChange={handleFilterChange}
                >
                  <option value="">All Regions</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>

              {/* Customer type filter */}
              <div>
                <label htmlFor="customerType" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Type
                </label>
                <select
                  id="customerType"
                  name="customerType"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filters.customerType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>

              {/* Orders range filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orders
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      name="minOrders"
                      placeholder="Min"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={filters.minOrders}
                      onChange={handleFilterChange}
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="maxOrders"
                      placeholder="Max"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={filters.maxOrders}
                      onChange={handleFilterChange}
                      min={filters.minOrders || '0'}
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

      {/* Customers table */}
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
              {data?.data?.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={`${customer._id}-${column.key}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${column.align || 'text-left'}`}
                    >
                      {column.render(customer)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!data?.hasNextPage}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                !data?.hasNextPage
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
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, data?.total || 0)}
                </span>{' '}
                of <span className="font-medium">{data?.total || 0}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                {Array.from(
                  { length: Math.min(5, Math.ceil((data?.total || 0) / ITEMS_PER_PAGE)) },
                  (_, i) => {
                    // Calculate page numbers to show (current page in the middle when possible)
                    let pageNum;
                    const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);
                    
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!data?.hasNextPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    !data?.hasNextPage
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

export default Customers;
