import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const AddStockIn = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [formData, setFormData] = useState({
    sparePartId: '',
    stockInQuantity: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingParts, setFetchingParts] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        setFetchingParts(true);
        const response = await axios.get('/api/spare-parts');
        setSpareParts(response.data);
        setFetchingParts(false);

        // Check if sparePartId is in the URL query params
        const params = new URLSearchParams(location.search);
        const sparePartId = params.get('sparePartId');

        if (sparePartId) {
          setFormData(prev => ({
            ...prev,
            sparePartId
          }));
        }
      } catch (error) {
        console.error('Error fetching spare parts:', error);
        setError('Failed to load spare parts');
        setFetchingParts(false);
      }
    };

    fetchSpareParts();
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { sparePartId, stockInQuantity } = formData;

    if (!sparePartId) newErrors.sparePartId = 'Please select a spare part';

    if (!stockInQuantity) {
      newErrors.stockInQuantity = 'Quantity is required';
    } else if (isNaN(stockInQuantity) || parseInt(stockInQuantity) <= 0) {
      newErrors.stockInQuantity = 'Quantity must be a positive number';
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
        ...formData,
        stockInQuantity: parseInt(formData.stockInQuantity)
      };

      await axios.post('/api/stock-in', dataToSubmit);

      setLoading(false);
      navigate('/stock-in');
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to add stock in record');
      console.error('Error adding stock in record:', error);
    }
  };

  if (fetchingParts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add Stock In</h1>
        <Link
          to="/stock-in"
          className="text-pink-600 hover:text-pink-800"
        >
          Back to Stock In Records
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sparePartId" className="block text-sm font-medium text-gray-700 mb-1">
                Spare Part <span className="text-red-500">*</span>
              </label>
              <select
                id="sparePartId"
                name="sparePartId"
                className={`w-full border ${errors.sparePartId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
                value={formData.sparePartId}
                onChange={handleChange}
              >
                <option value="">Select a spare part</option>
                {spareParts.map(part => (
                  <option key={part.id} value={part.id}>
                    {part.name} - {part.category} (Current: {part.quantity})
                  </option>
                ))}
              </select>
              {errors.sparePartId && (
                <p className="text-red-500 text-xs mt-1">{errors.sparePartId}</p>
              )}
            </div>

            <div>
              <label htmlFor="stockInQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stockInQuantity"
                name="stockInQuantity"
                min="1"
                className={`w-full border ${errors.stockInQuantity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
                value={formData.stockInQuantity}
                onChange={handleChange}
              />
              {errors.stockInQuantity && (
                <p className="text-red-500 text-xs mt-1">{errors.stockInQuantity}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Stock In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockIn;
