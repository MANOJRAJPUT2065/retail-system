import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SalesPage from './pages/SalesPage';
import Tools from './pages/Tools';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import InventoryPage from './pages/InventoryPage';
import ProductManagementPage from './pages/ProductManagementPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import SalesTrendsPage from './pages/SalesTrendsPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/products" element={<ProductManagementPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/trends" element={<SalesTrendsPage />} />
      </Routes>
    </>
  );
}

export default App;

