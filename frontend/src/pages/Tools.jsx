import { useState } from 'react';
import CSVUpload from '../components/CSVUpload';
import QuickOrder from '../components/QuickOrder';
import { salesAPI } from '../services/api';
import '../styles/Tools.css';

const Tools = () => {
  const handleCSVUpload = async (formData) => {
    // This will be implemented in backend
    const response = await salesAPI.uploadCSV(formData);
    return response;
  };

  const handleOrderSubmit = async (orderData) => {
    // This will be implemented in backend
    const response = await salesAPI.createQuickOrder(orderData);
    return response;
  };

  return (
    <div className="tools-page">
      <div className="tools-header">
        <h1>Management Tools</h1>
        <p>Bulk operations and quick order entry</p>
      </div>

      <div className="tools-grid">
        <CSVUpload onUpload={handleCSVUpload} type="sales" />
        <QuickOrder onOrderSubmit={handleOrderSubmit} />
      </div>
    </div>
  );
};

export default Tools;
