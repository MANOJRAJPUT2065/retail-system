import { Routes, Route } from 'react-router-dom';
import SalesPage from './pages/SalesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SalesPage />} />
    </Routes>
  );
}

export default App;

