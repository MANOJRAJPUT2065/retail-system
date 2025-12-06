import '../styles/SortDropdown.css';

const SortDropdown = ({ sortBy, sortOrder, onChange }) => {
  const handleSortByChange = (e) => {
    onChange(e.target.value, sortOrder);
  };

  const handleSortOrderChange = (e) => {
    onChange(sortBy, e.target.value);
  };

  return (
    <div className="sort-dropdown">
      <label>Sort By:</label>
      <select value={sortBy} onChange={handleSortByChange}>
        <option value="date">Date</option>
        <option value="quantity">Quantity</option>
        <option value="customerName">Customer Name</option>
      </select>
      <select value={sortOrder} onChange={handleSortOrderChange}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
};

export default SortDropdown;

