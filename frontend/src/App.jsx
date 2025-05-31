import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Spare Parts
import SparePartsList from './components/spare-parts/SparePartsList';
import AddSparePart from './components/spare-parts/AddSparePart';

// Stock In
import StockInList from './components/stock-in/StockInList';
import AddStockIn from './components/stock-in/AddStockIn';

// Stock Out
import StockOutList from './components/stock-out/StockOutList';
import AddStockOut from './components/stock-out/AddStockOut';
import EditStockOut from './components/stock-out/EditStockOut';

// Reports
import ReportsMenu from './components/reports/ReportsMenu';
import DailyStockOutReport from './components/reports/DailyStockOutReport';
import StockStatusReport from './components/reports/StockStatusReport';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Spare Parts */}
            <Route path="spare-parts" element={<SparePartsList />} />
            <Route path="spare-parts/add" element={<AddSparePart />} />

            {/* Stock In */}
            <Route path="stock-in" element={<StockInList />} />
            <Route path="stock-in/add" element={<AddStockIn />} />

            {/* Stock Out */}
            <Route path="stock-out" element={<StockOutList />} />
            <Route path="stock-out/add" element={<AddStockOut />} />
            <Route path="stock-out/edit/:id" element={<EditStockOut />} />

            {/* Reports */}
            <Route path="reports" element={<ReportsMenu />} />
            <Route path="reports/daily-stock-out" element={<DailyStockOutReport />} />
            <Route path="reports/stock-status" element={<StockStatusReport />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
