import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StockStatusReport = () => {
  const [stockStatus, setStockStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalQuantity: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    const fetchStockStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/reports/stock-status');
        setStockStatus(response.data);

        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(item => item.category))];
        setCategories(uniqueCategories);

        // Calculate summary
        const totalItems = response.data.length;
        const totalQuantity = response.data.reduce((sum, item) => sum + item.currentQuantity, 0);
        const lowStockItems = response.data.filter(item => item.currentQuantity < 10).length;

        setSummary({
          totalItems,
          totalQuantity,
          lowStockItems
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock status report:', error);
        setError('Failed to load stock status report');
        setLoading(false);
      }
    };

    fetchStockStatus();
  }, []);

  const filteredStockStatus = stockStatus.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handlePrint = () => {
    window.print();
  };

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
    <div className="print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Stock Status Report</h1>
        <div className="flex space-x-2">
          <Link
            to="/reports"
            className="text-pink-600 hover:text-pink-800"
          >
            Back to Reports
          </Link>
          <button
            onClick={handlePrint}
            className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md"
          >
            Print Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row gap-4 mb-4 print:hidden">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
              placeholder="Search by spare part name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="md:w-1/4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              id="category"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="print:block">
          <div className="text-center mb-6 hidden print:block">
            <h1 className="text-2xl font-bold">SmartPark SIMS</h1>
            <h2 className="text-xl">Stock Status Report</h2>
            <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
              <p className="text-2xl font-bold text-gray-800">{summary.totalItems}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Quantity in Stock</h3>
              <p className="text-2xl font-bold text-gray-800">{summary.totalQuantity}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
              <p className="text-2xl font-bold text-red-600">{summary.lowStockItems}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spare Part
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stock In
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stock Out
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStockStatus.length > 0 ? (
                  filteredStockStatus.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${item.currentQuantity < 10 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {item.currentQuantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.totalStockIn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.totalStockOut}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm print:hidden">
                        <div className="flex space-x-2">
                          {item.currentQuantity < 10 && (
                            <Link
                              to={`/stock-in/add?sparePartId=${item.id}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Stock In
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No spare parts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-right hidden print:block">
            <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockStatusReport;
