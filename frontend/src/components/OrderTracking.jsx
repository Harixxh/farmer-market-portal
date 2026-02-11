import { useState, useEffect } from 'react';
import api from '../config/api';

const trackingSteps = [
  { key: 'order_placed', label: 'Order Placed', icon: 'clipboard' },
  { key: 'payment_received', label: 'Payment Done', icon: 'card' },
  { key: 'accepted', label: 'Accepted', icon: 'check' },
  { key: 'packed', label: 'Packed', icon: 'box' },
  { key: 'shipped', label: 'Shipped', icon: 'truck' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'delivery' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
];

const StatusIcon = ({ type, active, completed }) => {
  const color = completed ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-300';
  const icons = {
    clipboard: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    card: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    check: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    box: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    truck: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    delivery: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    home: (
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  };
  return icons[type] || icons.check;
};

const OrderTracking = ({ order, onClose }) => {
  const [orderDetails, setOrderDetails] = useState(order);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    if (order?._id) {
      fetchOrderDetails();
      if (order.paymentStatus === 'paid') {
        fetchPaymentDetails();
      }
    }
  }, [order?._id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/api/orders/${order._id}`);
      if (res.data.success) {
        setOrderDetails(res.data.order);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const fetchPaymentDetails = async () => {
    setLoadingPayment(true);
    try {
      const res = await api.get(`/api/payments/${order._id}`);
      if (res.data.success) {
        setPaymentDetails(res.data.payment);
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
    } finally {
      setLoadingPayment(false);
    }
  };

  const completedStatuses = (orderDetails?.tracking || []).map(t => t.status);
  const isCancelled = orderDetails?.status === 'cancelled';
  const isRejected = orderDetails?.status === 'rejected';

  const getStepStatus = (stepKey) => {
    if (isCancelled || isRejected) return 'inactive';
    if (completedStatuses.includes(stepKey)) return 'completed';
    // COD orders skip payment_received step initially
    if (stepKey === 'payment_received' && orderDetails?.paymentMethod === 'cod' && orderDetails?.paymentStatus !== 'paid') {
      if (completedStatuses.includes('accepted')) return 'skipped';
      return 'inactive';
    }
    return 'inactive';
  };

  const getTrackingEvent = (stepKey) => {
    return (orderDetails?.tracking || []).find(t => t.status === stepKey);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Order Tracking</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {orderDetails?.produce?.cropName} - {orderDetails?.quantity} {orderDetails?.unit}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Order Info Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Order Amount</p>
                <p className="text-2xl font-bold text-green-700">₹{orderDetails?.totalAmount?.toLocaleString('en-IN')}</p>
                {orderDetails?.shippingCost && (
                  <p className="text-xs text-gray-600 mt-1">
                    + ₹{orderDetails.shippingCost} shipping
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  orderDetails?.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' :
                  orderDetails?.paymentStatus === 'refunded' ? 'bg-orange-200 text-orange-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {orderDetails?.paymentStatus === 'paid' ? 'Paid' :
                   orderDetails?.paymentStatus === 'refunded' ? 'Refunded' : 'Payment Pending'}
                </span>
                {orderDetails?.paymentMethod && (
                  <p className="text-xs text-gray-500 mt-1">
                    via {orderDetails.paymentMethod === 'razorpay' ? 'Online Payment' :
                         orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' :
                         orderDetails.paymentMethod.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
            {orderDetails?.estimatedDelivery && !isCancelled && !isRejected && orderDetails?.status !== 'delivered' && orderDetails?.status !== 'completed' && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-gray-600">
                  Estimated Delivery: <span className="font-semibold">{new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </p>
              </div>
            )}
          </div>

          {/* Shipping Information */}
          {orderDetails?.shippingAddress && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Shipping Information</h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <h5 className="font-medium text-gray-900">{orderDetails.shippingAddress.name}</h5>
                  <p className="text-sm text-gray-600">{orderDetails.shippingAddress.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {orderDetails.shippingAddress.addressLine1}
                    {orderDetails.shippingAddress.addressLine2 && `, ${orderDetails.shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.pincode}
                  </p>
                  {orderDetails.shippingAddress.landmark && (
                    <p className="text-xs text-gray-500 mt-1">Near: {orderDetails.shippingAddress.landmark}</p>
                  )}
                </div>
                
                {/* Carrier Information */}
                {orderDetails?.trackingNumber && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {orderDetails.carrierName || 'Shipping Partner'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tracking: {orderDetails.trackingNumber}
                        </p>
                      </div>
                      {orderDetails.carrierTrackingUrl && (
                        <a
                          href={orderDetails.carrierTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 flex items-center gap-1"
                        >
                          Track Package
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3M17 13l-5 5 5-5zM12 8l5-5-5 5z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancelled/Rejected Banner */}
          {(isCancelled || isRejected) && (
            <div className={`mb-6 p-4 rounded-xl ${isCancelled ? 'bg-gray-100' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2">
                <svg className={`w-5 h-5 ${isCancelled ? 'text-gray-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`font-semibold ${isCancelled ? 'text-gray-700' : 'text-red-700'}`}>
                  Order {isCancelled ? 'Cancelled' : 'Rejected'}
                </span>
              </div>
              {orderDetails?.paymentStatus === 'refunded' && (
                <p className="text-sm text-gray-600 mt-1 ml-7">Refund has been initiated</p>
              )}
            </div>
          )}

          {/* Tracking Timeline */}
          {!isCancelled && !isRejected && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Tracking Status</h4>
              <div className="space-y-0">
                {trackingSteps.map((step, index) => {
                  const status = getStepStatus(step.key);
                  const event = getTrackingEvent(step.key);
                  const isCompleted = status === 'completed';
                  const isActive = !isCompleted && index === trackingSteps.findIndex(s => getStepStatus(s.key) !== 'completed' && getStepStatus(s.key) !== 'skipped');
                  const isSkipped = status === 'skipped';
                  const isLast = index === trackingSteps.length - 1;

                  return (
                    <div key={step.key} className="flex gap-3">
                      {/* Line + Circle */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-100' :
                          isActive ? 'bg-blue-100 ring-2 ring-blue-300 ring-offset-2' :
                          isSkipped ? 'bg-yellow-50' :
                          'bg-gray-100'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <StatusIcon type={step.icon} active={isActive} completed={isCompleted} />
                          )}
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <p className={`font-medium ${
                          isCompleted ? 'text-green-700' :
                          isActive ? 'text-blue-700' :
                          isSkipped ? 'text-yellow-600' :
                          'text-gray-400'
                        }`}>
                          {step.label}
                          {isSkipped && <span className="text-xs ml-2">(COD - pay on delivery)</span>}
                        </p>
                        {event && (
                          <>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(event.timestamp).toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                              {event.location && (
                                <span className="ml-2">• {event.location}</span>
                              )}
                            </p>
                            {event?.description && (
                              <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Details */}
          {orderDetails?.paymentStatus === 'paid' && paymentDetails && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium text-green-600">Paid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-medium">₹{paymentDetails.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                {paymentDetails.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Paid On</span>
                    <span className="text-sm font-medium">
                      {new Date(paymentDetails.paidAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {paymentDetails.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Transaction ID</span>
                    <span className="text-sm font-mono text-gray-600">{paymentDetails.razorpayPaymentId}</span>
                  </div>
                )}
                {paymentDetails.razorpayDetails?.method && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Method</span>
                    <span className="text-sm font-medium capitalize">{paymentDetails.razorpayDetails.method}</span>
                  </div>
                )}
                {paymentDetails.razorpayDetails?.vpa && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">UPI ID</span>
                    <span className="text-sm font-medium">{paymentDetails.razorpayDetails.vpa}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Tracking History */}
          {orderDetails?.tracking?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Activity Log</h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 max-h-48 overflow-y-auto">
                {[...orderDetails.tracking].reverse().map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-gray-700">{event.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                        {event.location && (
                          <span className="ml-2">• {event.location}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
