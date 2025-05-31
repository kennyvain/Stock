import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const EditStockOut = () => {
  const [stockOut, setStockOut] = useState(null);
  const [formData, setFormData] = useState({
    stockOutQuantity: '',
    stockOutUnitPrice: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchStockOut = async () => {
      try {
        setFetchingData(true);
        const response = await axios.get(`/api/stock-out/${id}`);
        setStockOut(response.data);
        setFormData({
          stockOutQuantity: response.data.stockOutQuantity.toString(),
          stockOutUnitPrice: response.data.stockOutUnitPrice.toString()
        });
        setFetchingData(false);
      } catch (error) {
        console.error('Error fetching stock out record:', error);
        setError('Failed to load stock out record');
        setFetchingData(false);
      }
    };

    fetchStockOut();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { stockOutQuantity, stockOutUnitPrice } = formData;

    if (!stockOutQuantity) {
      newErrors.stockOutQuantity = 'Quantity is required';
    } else if (isNaN(stockOutQuantity) || parseInt(stockOutQuantity) <= 0) {
      newErrors.stockOutQuantity = 'Quantity must be a positive number';
    }

    if (!stockOutUnitPrice) {
      newErrors.stockOutUnitPrice = 'Unit price is required';
    } else if (isNaN(stockOutUnitPrice) || parseFloat(stockOutUnitPrice) <= 0) {
      newErrors.stockOutUnitPrice = 'Unit price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const dataToSubmit = {
        stockOutQuantity: parseInt(formData.stockOutQuantity),
        stockOutUnitPrice: parseFloat(formData.stockOutUnitPrice)
      };

      await axios.put(`/api/stock-out/${id}`, dataToSubmit);

      setLoading(false);
      navigate('/stock-out');
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to update stock out record');
      console.error('Error updating stock out record:', error);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!stockOut) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">Stock out record not found</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Stock Out</h1>
        <Link
          to="/stock-out"
          className="text-pink-600 hover:text-pink-800"
        >
          Back to Stock Out Records
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Spare Part Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-base font-medium">{stockOut.sparePartName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-base">{stockOut.category}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="stockOutQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stockOutQuantity"
                name="stockOutQuantity"
                min="1"
                className={`w-full border ${errors.stockOutQuantity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
                value={formData.stockOutQuantity}
                onChange={handleChange}
              />
              {errors.stockOutQuantity && (
                <p className="text-red-500 text-xs mt-1">{errors.stockOutQuantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="stockOutUnitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stockOutUnitPrice"
                name="stockOutUnitPrice"
                min="0.01"
                step="0.01"
                className={`w-full border ${errors.stockOutUnitPrice ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
                value={formData.stockOutUnitPrice}
                onChange={handleChange}
              />
              {errors.stockOutUnitPrice && (
                <p className="text-red-500 text-xs mt-1">{errors.stockOutUnitPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Price
              </label>
              <div className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500">
                ${(parseFloat(formData.stockOutUnitPrice || 0) * parseInt(formData.stockOutQuantity || 0)).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStockOut;
