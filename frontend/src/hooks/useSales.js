import { useState, useEffect, useCallback } from 'react';
import { salesAPI } from '../services/api';

const useSales = () => {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    regions: [],
    genders: [],
    ageMin: null,
    ageMax: null,
    categories: [],
    tags: [],
    paymentMethods: [],
    dateFrom: null,
    dateTo: null,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchSales = useCallback(async (pageArg = page, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pageArg,
        limit,
        ...filters,
        regions: filters.regions.join(','),
        genders: filters.genders.join(','),
        categories: filters.categories.join(','),
        tags: filters.tags.join(','),
        paymentMethods: filters.paymentMethods.join(','),
        ageMin: filters.ageMin || undefined,
        ageMax: filters.ageMax || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        search: filters.search || undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const data = await salesAPI.getSales(params);
      setPagination(data.pagination);
      setSales(data.sales);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales data');
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    // Refetch whenever filters, page or limit change
    fetchSales(page, false);
  }, [fetchSales]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const updatePage = (newPage) => {
    setPage(newPage);
  };

  const updateLimit = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      regions: [],
      genders: [],
      ageMin: null,
      ageMax: null,
      categories: [],
      tags: [],
      paymentMethods: [],
      dateFrom: null,
      dateTo: null,
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setPage(1);
  };

  return {
    sales,
    pagination,
    loading,
    error,
    filters,
    page,
    limit,
    updateFilters,
    updatePage,
    updateLimit,
    resetFilters,
    refetch: fetchSales
  };
};

export default useSales;

