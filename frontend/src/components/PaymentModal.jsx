import { useState } from 'react';
import api from '../config/api';

const RAZORPAY_KEY = 'rzp_test_placeholder'; // Will be fetched from backend

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState(null); // 'razorpay' or 'cod'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Failed to load payment gateway. Check your internet connection.');
        setLoading(false);
        return;
      }

      // Create Razorpay order from backend
      const res = await api.post('/api/payments/create-order', {
        orderId: order._id
      });

      const { razorpayOrder, key } = res.data;

      const options = {
        key: key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'AgriMarket',
        description: `Payment for ${order.produce?.cropName || 'Order'}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyRes = await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });

            if (verifyRes.data.success) {
              onSuccess(verifyRes.data.order);
            }
          } catch (err) {
            setError('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : '',
          email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : '',
        },
        theme: {
          color: '#16a34a'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/payments/cod', {
        orderId: order._id
      });

      if (res.data.success) {
        onSuccess(res.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select COD');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else if (paymentMethod === 'cod') {
      handleCOD();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Payment</h3>
              <p className="text-sm text-gray-500 mt-0.5">Choose your payment method</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Order</span>
              <span className="text-sm font-medium text-gray-800">{order.produce?.cropName}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Quantity</span>
              <span className="text-sm font-medium text-gray-800">{order.quantity} {order.unit}</span>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total Amount</span>
                <span className="text-xl font-bold text-green-600">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            {/* Razorpay Option */}
            <button
              onClick={() => setPaymentMethod('razorpay')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === 'razorpay'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'razorpay' ? 'border-green-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                    <span className="font-semibold text-gray-800">Pay Online</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">UPI, Credit/Debit Card, Net Banking, Wallets</p>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">Secure</span>
              </div>
            </button>

            {/* COD Option */}
            <button
              onClick={() => setPaymentMethod('cod')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === 'cod'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'cod' ? 'border-green-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                    <span className="font-semibold text-gray-800">Cash on Delivery</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-7">Pay when you receive the produce</p>
                </div>
              </div>
            </button>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span className="text-xs text-blue-700">Your payment information is encrypted and secure. We never store your card details.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!paymentMethod || loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Processing...
                </span>
              ) : paymentMethod === 'razorpay' ? (
                `Pay ₹${order.totalAmount?.toLocaleString('en-IN')}`
              ) : paymentMethod === 'cod' ? (
                'Confirm COD'
              ) : (
                'Select Payment Method'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
