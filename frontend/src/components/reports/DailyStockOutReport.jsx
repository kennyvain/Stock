import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DailyStockOutReport = () => {
  const [stockOuts, setStockOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0
  });

  useEffect(() => {
    const fetchDailyStockOut = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/reports/daily-stock-out?date=${date}`);
        setStockOuts(response.data);

        // Calculate summary
        const totalItems = response.data.length;
        const totalQuantity = response.data.reduce((sum, item) => sum + item.stockOutQuantity, 0);
        const totalValue = response.data.reduce((sum, item) => sum + item.stockOutTotalPrice, 0);

        setSummary({
          totalItems,
          totalQuantity,
          totalValue
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching daily stock out report:', error);
        setError('Failed to load daily stock out report');
        setLoading(false);
      }
    };

    fetchDailyStockOut();
  }, [date]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Daily Stock Out Report</h1>
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
        <div className="flex flex-col md:flex-row gap-4 print:hidden">
          <div className="md:w-1/4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              id="date"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="print:block">
          <div className="text-center mb-6 hidden print:block">
            <h1 className="text-2xl font-bold">SmartPark SIMS</h1>
            <h2 className="text-xl">Daily Stock Out Report</h2>
            <p className="text-gray-600">Date: {new Date(date).toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
              <p className="text-2xl font-bold text-gray-800">{summary.totalItems}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
              <p className="text-2xl font-bold text-gray-800">{summary.totalQuantity}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-2xl font-bold text-gray-800">${parseFloat(summary.totalValue).toFixed(2)}</p>
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
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockOuts.length > 0 ? (
                  stockOuts.map(stockOut => (
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No stock out records found for this date
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

export default DailyStockOutReport;
