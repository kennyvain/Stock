import { Link } from 'react-router-dom';

const ReportsMenu = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Stock Out Report</h2>
          <p className="text-gray-600 mb-4">
            View all stock out transactions for a specific date. This report shows the spare parts taken out of stock,
            their quantities, unit prices, and total prices.
          </p>
          <Link
            to="/reports/daily-stock-out"
            className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md inline-block"
          >
            View Report
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock Status Report</h2>
          <p className="text-gray-600 mb-4">
            View the current status of all spare parts in stock. This report shows the current quantity,
            total stock in, and total stock out for each spare part.
          </p>
          <Link
            to="/reports/stock-status"
            className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md inline-block"
          >
            View Report
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportsMenu;
