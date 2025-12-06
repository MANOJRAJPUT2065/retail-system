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

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 10,
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
      setSales(data.sales);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales data');
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const updatePage = (newPage) => {
    setPage(newPage);
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
    updateFilters,
    updatePage,
    resetFilters,
    refetch: fetchSales
  };
};

export default useSales;

