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

  const fetchSales = useCallback(async (pageArg = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pageArg,
        // Use a reasonable page size for large datasets
        limit: 2000,
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
      setSales(prev => (append ? [...prev, ...data.sales] : data.sales));
    } catch (err) {
      setError(err.message || 'Failed to fetch sales data');
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // On filter change, reset to first page and fetch fresh data
    setPage(1);
    fetchSales(1, false);
  }, [fetchSales]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const updatePage = (newPage) => {
    setPage(newPage);
  };

  const loadMore = async () => {
    if (pagination.hasNextPage) {
      const nextPage = page + 1;
      // Fetch next page and append
      await fetchSales(nextPage, true);
      setPage(nextPage);
    }
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
    refetch: fetchSales,
    loadMore
  };
};

export default useSales;

