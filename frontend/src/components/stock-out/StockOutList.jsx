import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StockOutList = () => {
  const [stockOuts, setStockOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStockOuts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/stock-out');
      setStockOuts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock out records:', error);
      setError('Failed to load stock out records');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockOuts();
  }, []);

  const filteredStockOuts = stockOuts.filter(stockOut => {
    const matchesSearch = stockOut.sparePartName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stockOut.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter ||
                       new Date(stockOut.stockOutDate).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock out record?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await axios.delete(`/api/stock-out/${id}`);
      await fetchStockOuts();
      setDeleteLoading(false);
    } catch (error) {
      console.error('Error deleting stock out record:', error);
      setError(error.response?.data?.message || 'Failed to delete stock out record');
      setDeleteLoading(false);
    }
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Out Records</h1>
        <Link
          to="/stock-out/add"
          className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md"
        >
          Add Stock Out
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
              placeholder="Search by spare part name or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="md:w-1/4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              id="date"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStockOuts.length > 0 ? (
                filteredStockOuts.map(stockOut => (
                  <tr key={stockOut.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{stockOut.sparePartName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{stockOut.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stockOut.stockOutQuantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${parseFloat(stockOut.stockOutUnitPrice).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${parseFloat(stockOut.stockOutTotalPrice).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(stockOut.stockOutDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Link
                          to={`/stock-out/edit/${stockOut.id}`}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(stockOut.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleteLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No stock out records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockOutList;
