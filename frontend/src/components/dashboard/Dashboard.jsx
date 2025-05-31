import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSpareParts: 0,
    totalStockIn: 0,
    totalStockOut: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch spare parts
        const sparePartsRes = await axios.get('/api/spare-parts');
        const spareParts = sparePartsRes.data;

        // Fetch stock in
        const stockInRes = await axios.get('/api/stock-in');
        const stockIn = stockInRes.data;

        // Fetch stock out
        const stockOutRes = await axios.get('/api/stock-out');
        const stockOut = stockOutRes.data;

        // Calculate stats
        const lowStockItems = spareParts.filter(part => part.quantity < 10).length;

        setStats({
          totalSpareParts: spareParts.length,
          totalStockIn: stockIn.length,
          totalStockOut: stockOut.length,
          lowStockItems
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.fullName}</h1>
        <p className="text-gray-600">Stock Inventory Management System Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Spare Parts</h2>
          <p className="text-3xl font-bold text-pink-600">{stats.totalSpareParts}</p>
          <Link to="/spare-parts" className="text-pink-600 hover:text-pink-800 text-sm mt-4 inline-block">
            View all spare parts
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Stock In</h2>
          <p className="text-3xl font-bold text-green-600">{stats.totalStockIn}</p>
          <Link to="/stock-in" className="text-pink-600 hover:text-pink-800 text-sm mt-4 inline-block">
            View stock in records
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Stock Out</h2>
          <p className="text-3xl font-bold text-red-600">{stats.totalStockOut}</p>
          <Link to="/stock-out" className="text-pink-600 hover:text-pink-800 text-sm mt-4 inline-block">
            View stock out records
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Low Stock Items</h2>
          <p className="text-3xl font-bold text-yellow-600">{stats.lowStockItems}</p>
          <Link to="/reports/stock-status" className="text-pink-600 hover:text-pink-800 text-sm mt-4 inline-block">
            View stock status
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/spare-parts/add"
            className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-4 rounded-md text-center"
          >
            Add New Spare Part
          </Link>
          <Link
            to="/stock-in/add"
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md text-center"
          >
            Record Stock In
          </Link>
          <Link
            to="/stock-out/add"
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md text-center"
          >
            Record Stock Out
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
