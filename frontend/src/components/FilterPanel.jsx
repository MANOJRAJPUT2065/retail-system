import '../styles/FilterPanel.css';

const FilterPanel = ({ filters, options, loading, onChange, onReset }) => {
  if (loading) {
    return <div className="filter-panel loading">Loading filter options...</div>;
  }

  const handleMultiSelect = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    if (checked) {
      onChange(filterType, [...currentValues, value]);
    } else {
      onChange(filterType, currentValues.filter(v => v !== value));
    }
  };

  const handleRangeChange = (filterType, value) => {
    onChange(filterType, value === '' ? null : parseInt(value));
  };

  const handleDateChange = (filterType, value) => {
    onChange(filterType, value || null);
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="reset-btn" onClick={onReset}>Reset All</button>
      </div>

      <div className="filters-grid">
        {/* Customer Region */}
        <div className="filter-group">
          <label>Customer Region</label>
          <div className="checkbox-group">
            {options.regions.map(region => (
              <label key={region} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.regions.includes(region)}
                  onChange={(e) => handleMultiSelect('regions', region, e.target.checked)}
                />
                <span>{region}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="filter-group">
          <label>Gender</label>
          <div className="checkbox-group">
            {options.genders.map(gender => (
              <label key={gender} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.genders.includes(gender)}
                  onChange={(e) => handleMultiSelect('genders', gender, e.target.checked)}
                />
                <span>{gender}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div className="filter-group">
          <label>Age Range</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              min={options.ageRange.minAge}
              max={options.ageRange.maxAge}
              value={filters.ageMin || ''}
              onChange={(e) => handleRangeChange('ageMin', e.target.value)}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              min={options.ageRange.minAge}
              max={options.ageRange.maxAge}
              value={filters.ageMax || ''}
              onChange={(e) => handleRangeChange('ageMax', e.target.value)}
            />
          </div>
        </div>

        {/* Product Category */}
        <div className="filter-group">
          <label>Product Category</label>
          <div className="checkbox-group">
            {options.categories.map(category => (
              <label key={category} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={(e) => handleMultiSelect('categories', category, e.target.checked)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="filter-group">
          <label>Tags</label>
          <div className="checkbox-group">
            {options.tags.map(tag => (
              <label key={tag} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag)}
                  onChange={(e) => handleMultiSelect('tags', tag, e.target.checked)}
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="filter-group">
          <label>Payment Method</label>
          <div className="checkbox-group">
            {options.paymentMethods.map(method => (
              <label key={method} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.paymentMethods.includes(method)}
                  onChange={(e) => handleMultiSelect('paymentMethods', method, e.target.checked)}
                />
                <span>{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-inputs">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

