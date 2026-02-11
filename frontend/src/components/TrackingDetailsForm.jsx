import React, { useState } from 'react';
import { orderAPI } from '../config/api';

const TrackingDetailsForm = ({ order, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    trackingNumber: order?.trackingNumber || '',
    carrierName: order?.carrierName || '',
    shippingCost: order?.shippingCost || ''
  });

  const carriers = [
    'Blue Dart',
    'DTDC',
    'India Post',
    'Delhivery',
    'Ecom Express',
    'FedEx',
    'DHL',
    'Aramex',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        trackingNumber: formData.trackingNumber.trim(),
        carrierName: formData.carrierName,
        shippingCost: parseFloat(formData.shippingCost) || 0
      };

      const response = await orderAPI.updateTrackingDetails(order._id, payload);
      
      if (response.data.success) {
        onUpdate && onUpdate(response.data.order);
        onClose();
        alert('Tracking details updated successfully!');
      } else {
        setError(response.data.message || 'Failed to update tracking details');
      }
    } catch (err) {
      console.error('Error updating tracking details:', err);
      setError(err.response?.data?.message || 'Failed to update tracking details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Add Tracking Details</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Order: {order?.produce?.cropName} - {order?.quantity} {order?.unit}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Carrier Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Carrier *
              </label>
              <select
                value={formData.carrierName}
                onChange={(e) => handleInputChange('carrierName', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="">Select Carrier</option>
                {carriers.map(carrier => (
                  <option key={carrier} value={carrier}>{carrier}</option>
                ))}
              </select>
            </div>

            {/* Tracking Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number *
              </label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                required
                placeholder="Enter tracking number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            {/* Shipping Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.shippingCost}
                onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Automatic Tracking URL</p>
                  <p>We'll automatically generate carrier tracking URLs for supported carriers. Buyers can click to track their packages.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Updating...' : 'Update Tracking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrackingDetailsForm;