import { useState, useEffect } from 'react';
import { debounce } from '../utils/debounce';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch, value }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');

  // Debounce search to reduce API calls
  const debouncedSearch = debounce((term) => {
    onSearch(term);
  }, 300);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const handleChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by Customer Name or Phone Number..."
        value={searchTerm}
        onChange={handleChange}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;

