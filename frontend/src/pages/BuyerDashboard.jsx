import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { useLanguage } from '../context/LanguageContext';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'browse';
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [produce, setProduce] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser.role !== 'buyer') {
          navigate('/dashboard');
          return;
        }
        fetchData();
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const cfg = { _skipAuthRedirect: true };
      const [produceRes, pricesRes, farmersRes, ordersRes] = await Promise.all([
        api.get('/api/produce/marketplace', cfg).catch(() => ({ data: { produce: [] } })),
        api.get('/api/market/prices', cfg).catch(() => ({ data: { prices: [] } })),
        api.get('/api/profile/farmers', cfg).catch(() => ({ data: { farmers: [] } })),
        api.get('/api/orders/buyer', cfg).catch(() => ({ data: { orders: [] } }))
      ]);
      setProduce(produceRes.data.produce || []);
      setMarketPrices(pricesRes.data.prices || []);
      setFarmers(farmersRes.data.farmers || []);
      setMyOrders(ordersRes.data.orders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduce || orderQuantity <= 0) return;
    
    try {
      await api.post('/api/orders', {
        produceId: selectedProduce._id,
        quantity: orderQuantity,
        totalAmount: orderQuantity * selectedProduce.expectedPrice
      });
      setShowOrderModal(false);
      setSelectedProduce(null);
      setOrderQuantity(1);
      fetchData();
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await api.patch(`/api/orders/${orderId}/cancel`);
      fetchData();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const openOrderModal = (item) => {
    setSelectedProduce(item);
    setOrderQuantity(1);
    setShowOrderModal(true);
  };

  const filteredProduce = produce.filter(item => {
    const matchesSearch = item.cropName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.farmer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.status === 'active';
  });

  const categories = ['all', 'vegetables', 'fruits', 'grains', 'pulses', 'spices', 'oilseeds'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const pendingOrders = myOrders.filter(o => o.status === 'pending').length;
  const completedOrders = myOrders.filter(o => o.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Browse Crops Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">{t('availableCrops')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{filteredProduce.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">{t('activeFarmers')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{farmers.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">{t('pendingOrders')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{pendingOrders}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">{t('completedOrders')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{completedOrders}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('searchCropsOrFarmers')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? t('allCategories') : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Produce Grid */}
            {filteredProduce.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <h3 className="text-lg font-medium text-gray-800">{t('noCropsAvailable')}</h3>
                <p className="text-gray-500 mt-1">{t('adjustSearch')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProduce.map((item) => (
                  <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="h-1.5 bg-green-500"></div>
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{item.cropName}</h3>
                          <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          {t('grade')} {item.quality || 'A'}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">{t('available')}</p>
                          <p className="font-semibold text-gray-800">{item.quantity} {typeof item.unit === 'object' ? (item.unit?.unit || 'quintal') : (item.unit || 'quintal')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">{t('price')}</p>
                          <p className="font-semibold text-green-600">₹{item.expectedPrice}/{typeof item.unit === 'object' ? (item.unit?.unit || 'quintal') : (item.unit || 'quintal')}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{t('farmer')}:</span> {item.farmer?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{t('location')}:</span> {item.location ? (typeof item.location === 'object' ? [item.location.village, item.location.district, item.location.state].filter(Boolean).join(', ') : item.location) : t('notSpecified')}
                        </p>
                      </div>

                      <button
                        onClick={() => openOrderModal(item)}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                      >
                        {t('placeOrder')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Modal */}
            {showOrderModal && selectedProduce && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">{t('placeOrder')}</h3>
                      <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800">{selectedProduce.cropName}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {t('farmer')}: {selectedProduce.farmer?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('location')}: {selectedProduce.location ? (typeof selectedProduce.location === 'object' ? [selectedProduce.location.village, selectedProduce.location.district, selectedProduce.location.state].filter(Boolean).join(', ') : selectedProduce.location) : t('notSpecified')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('available')}: {selectedProduce.quantity} {typeof selectedProduce.unit === 'object' ? (selectedProduce.unit?.unit || 'quintal') : (selectedProduce.unit || 'quintal')}
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-2">₹{selectedProduce.expectedPrice}/{typeof selectedProduce.unit === 'object' ? (selectedProduce.unit?.unit || 'quintal') : (selectedProduce.unit || 'quintal')}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('quantity')} ({typeof selectedProduce.unit === 'object' ? (selectedProduce.unit?.unit || 'quintal') : (selectedProduce.unit || 'quintal')})</label>
                        <input
                          type="number"
                          min="1"
                          max={selectedProduce.quantity}
                          value={orderQuantity}
                          onChange={(e) => setOrderQuantity(Math.min(Number(e.target.value), selectedProduce.quantity))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('totalAmount')}:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{(orderQuantity * selectedProduce.expectedPrice).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setShowOrderModal(false)}
                          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          onClick={handlePlaceOrder}
                          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium"
                        >
                          {t('confirmOrder')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Market Prices Tab */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('liveMarketPrices')}</h2>
              <p className="text-gray-500 text-sm mb-6">{t('realtimePrices')}</p>

              {marketPrices.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">{t('noPriceData')}</h3>
                  <p className="text-gray-500 mt-1">{t('pricesWillAppear')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t('commodity')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">{t('market')}</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">{t('minPrice')}</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">{t('maxPrice')}</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">{t('modalPrice')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketPrices.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-800">{item.commodity}</td>
                          <td className="py-4 px-4 text-gray-600">{item.market}</td>
                          <td className="py-4 px-4 text-right text-gray-600">₹{item.minPrice?.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-4 text-right text-gray-600">₹{item.maxPrice?.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-4 text-right font-semibold text-green-600">₹{item.modalPrice?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Farmers Directory Tab */}
        {activeTab === 'farmers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">{t('registeredFarmers')}</h2>

              {farmers.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">{t('noFarmersFound')}</h3>
                  <p className="text-gray-500 mt-1">{t('farmersWillAppear')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmers.map((farmer) => (
                    <div key={farmer._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-lg">
                          {farmer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{farmer.name}</h3>
                          <p className="text-sm text-gray-500">{farmer.location || t('notSpecified')}</p>
                          {farmer.farmSize && (
                            <p className="text-sm text-gray-500">{t('farmSize')}: {farmer.farmSize} acres</p>
                          )}
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{t('activeListings')}:</span> {farmer.activeListings || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">{t('myOrders')}</h2>

              {myOrders.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">{t('noOrdersYet')}</h3>
                  <p className="text-gray-500 mt-1">{t('ordersWillAppearHere')}</p>
                  <button
                    onClick={() => navigate('/buyer-dashboard?tab=browse')}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    {t('browseCrops')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">{order.produce?.cropName}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {t('farmer')}: {order.produce?.farmer?.name || order.farmer?.name} | {t('quantity')}: {order.quantity} {typeof order.produce?.unit === 'object' ? (order.produce?.unit?.unit || '') : (order.produce?.unit || '')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t('orderDate')}: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <p className="text-xl font-bold text-green-600">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            order.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {order.status === 'pending' && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
                          >
                            {t('cancelOrder')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
