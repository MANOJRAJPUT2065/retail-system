import { useState } from 'react';
import useSales from '../hooks/useSales';
import useFilterOptions from '../hooks/useFilterOptions';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import SalesTable from '../components/SalesTable';
import Pagination from '../components/Pagination';
import SortDropdown from '../components/SortDropdown';
import '../styles/SalesPage.css';

const SalesPage = () => {
  const {
    sales,
    pagination,
    loading,
    error,
    filters,
    page,
    updateFilters,
    updatePage,
    resetFilters,
    loadMore
  } = useSales();

  const { options: filterOptions, loading: optionsLoading } = useFilterOptions();
  const [showFilters, setShowFilters] = useState(true);

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  const handleFilterChange = (filterType, value) => {
    updateFilters({ [filterType]: value });
  };

  const handleSortChange = (sortBy, sortOrder) => {
    updateFilters({ sortBy, sortOrder });
  };

  return (
    <div className="sales-page">
      <div className="sales-container">
        <div className="page-header">
          <h1>Sales Management</h1>
          <p>View and manage all sales transactions</p>
        </div>

        <div className="sales-controls">
          <div className="controls-top">
            <SearchBar onSearch={handleSearch} value={filters.search} />
            <div className="controls-right">
              <SortDropdown
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onChange={handleSortChange}
              />
              <button
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {showFilters && (
            <FilterPanel
              filters={filters}
              options={filterOptions}
              loading={optionsLoading}
              onChange={handleFilterChange}
              onReset={resetFilters}
            />
          )}
        </div>

        <div className="sales-content">
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error">Error: {error}</div>}
          {!loading && !error && (
            <>
              {sales.length === 0 ? (
                <div className="no-results">
                  <p>No sales records found. Try adjusting your search or filters.</p>
                </div>
              ) : (
                <>
                  <div className="sales-info">
                    <span className="record-count">📊 Total Records: {pagination.totalItems}</span>
                    <span className="record-progress">Showing {sales.length} of {pagination.totalItems}</span>
                  </div>
                  <SalesTable sales={sales} />
                  {pagination.hasNextPage && (
                    <div className="load-more-container">
                      <button className="load-more" onClick={loadMore} disabled={loading}>
                        {loading ? 'Loading…' : `Load More (${sales.length}/${pagination.totalItems})`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesPage;

