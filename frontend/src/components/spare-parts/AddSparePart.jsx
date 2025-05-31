import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AddSparePart = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unitPrice: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, category, quantity, unitPrice } = formData;

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!category.trim()) newErrors.category = 'Category is required';

    if (!quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantity) || parseInt(quantity) < 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    if (!unitPrice) {
      newErrors.unitPrice = 'Unit price is required';
    } else if (isNaN(unitPrice) || parseFloat(unitPrice) <= 0) {
      newErrors.unitPrice = 'Unit price must be a positive number';
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
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice)
      };

      await axios.post('/api/spare-parts', dataToSubmit);

      setLoading(false);
      navigate('/spare-parts');
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to add spare part');
      console.error('Error adding spare part:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Spare Part</h1>
        <Link
          to="/spare-parts"
          className="text-pink-600 hover:text-pink-800"
        >
          Back to Spare Parts
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="category"
                name="category"
                className={`w-full border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
                value={formData.category}
                onChange={handleChange}
              />
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Initial Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="0"
                className={`w-full border ${errors.quantity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
                value={formData.quantity}
                onChange={handleChange}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                min="0.01"
                step="0.01"
                className={`w-full border ${errors.unitPrice ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500`}
                value={formData.unitPrice}
                onChange={handleChange}
              />
              {errors.unitPrice && (
                <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Spare Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSparePart;
