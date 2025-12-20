import { useState, useEffect } from 'react';
import { salesAPI } from '../services/api';
import '../styles/Customers.css';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [regions, setRegions] = useState([]);
  const [genders, setGenders] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchFilters();
  }, [searchTerm, filterRegion, filterGender]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getSales({
        page: 1,
        limit: 10000, // Fetch all records
        search: searchTerm,
        regions: filterRegion ? [filterRegion] : [],
        genders: filterGender ? [filterGender] : []
      });
      
      // Group by customer
      const customerMap = new Map();
      response.sales.forEach(sale => {
        if (!customerMap.has(sale.customerId)) {
          customerMap.set(sale.customerId, {
            customerId: sale.customerId,
            customerName: sale.customerName,
            phoneNumber: sale.phoneNumber,
            gender: sale.gender,
            age: sale.age,
            customerRegion: sale.customerRegion,
            totalSpent: 0,
            orderCount: 0,
            lastOrder: null
          });
        }
        const customer = customerMap.get(sale.customerId);
        customer.totalSpent += sale.finalAmount;
        customer.orderCount += 1;
        if (!customer.lastOrder || new Date(sale.date) > new Date(customer.lastOrder)) {
          customer.lastOrder = sale.date;
        }
      });
      
      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const options = await salesAPI.getFilterOptions();
      setRegions(options.regions || []);
      setGenders(options.genders || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  return (
    <div className="customers-page">
      <div className="customers-header">
        <h1>👥 Customer Management</h1>
        <p>View and manage all your customers</p>
      </div>

      <div className="customers-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
            <option value="">All Genders</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading customers...</div>
      ) : (
        <div className="customers-table">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Region</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.customerId}>
                    <td className="customer-name">{customer.customerName}</td>
                    <td>{customer.phoneNumber}</td>
                    <td><span className="region-badge">{customer.customerRegion}</span></td>
                    <td>{customer.gender}</td>
                    <td>{customer.age}</td>
                    <td className="order-count">{customer.orderCount}</td>
                    <td className="amount">₹{customer.totalSpent.toLocaleString('en-IN')}</td>
                    <td className="date">
                      {customer.lastOrder 
                        ? new Date(customer.lastOrder).toLocaleDateString('en-IN')
                        : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="customers-stats">
        <div className="stat-card">
          <span className="stat-label">Total Customers</span>
          <span className="stat-value">{customers.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">
            {customers.reduce((sum, c) => sum + c.orderCount, 0)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Order Value</span>
          <span className="stat-value">
            ₹{customers.length > 0
              ? Math.round(
                  customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                  customers.reduce((sum, c) => sum + c.orderCount, 0)
                ).toLocaleString('en-IN')
              : 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
