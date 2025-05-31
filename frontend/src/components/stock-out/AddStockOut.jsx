import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const AddStockOut = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [formData, setFormData] = useState({
    sparePartId: '',
    stockOutQuantity: '',
    stockOutUnitPrice: ''
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
          const part = response.data.find(p => p.id.toString() === sparePartId);
          if (part) {
            setSelectedPart(part);
            setFormData(prev => ({
              ...prev,
              sparePartId,
              stockOutUnitPrice: part.unitPrice.toString()
            }));
          }
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

    if (name === 'sparePartId' && value) {
      const part = spareParts.find(p => p.id.toString() === value);
      setSelectedPart(part);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        stockOutUnitPrice: part.unitPrice.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { sparePartId, stockOutQuantity, stockOutUnitPrice } = formData;

    if (!sparePartId) newErrors.sparePartId = 'Please select a spare part';

    if (!stockOutQuantity) {
      newErrors.stockOutQuantity = 'Quantity is required';
    } else if (isNaN(stockOutQuantity) || parseInt(stockOutQuantity) <= 0) {
      newErrors.stockOutQuantity = 'Quantity must be a positive number';
    } else if (selectedPart && parseInt(stockOutQuantity) > selectedPart.quantity) {
      newErrors.stockOutQuantity = `Not enough quantity in stock. Available: ${selectedPart.quantity}`;
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
        ...formData,
        stockOutQuantity: parseInt(formData.stockOutQuantity),
        stockOutUnitPrice: parseFloat(formData.stockOutUnitPrice)
      };

      await axios.post('/api/stock-out', dataToSubmit);

      setLoading(false);
      navigate('/stock-out');
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to add stock out record');
      console.error('Error adding stock out record:', error);
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
        <h1 className="text-2xl font-bold text-gray-800">Add Stock Out</h1>
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
                  <option key={part.id} value={part.id} disabled={part.quantity === 0}>
                    {part.name} - {part.category} (Available: {part.quantity})
                  </option>
                ))}
              </select>
              {errors.sparePartId && (
                <p className="text-red-500 text-xs mt-1">{errors.sparePartId}</p>
              )}
            </div>

            <div>
              <label htmlFor="stockOutQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stockOutQuantity"
                name="stockOutQuantity"
                min="1"
                max={selectedPart?.quantity || 1}
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
              {loading ? 'Adding...' : 'Add Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockOut;
