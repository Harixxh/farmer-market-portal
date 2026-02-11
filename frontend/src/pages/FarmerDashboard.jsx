import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import ImageUpload from '../components/ImageUpload';
import WhatsAppShareButton, { shareProduceListing, shareMarketPrice } from '../components/WhatsAppShare';
import LoadingOverlay, { ErrorBanner, SuccessToast, ButtonSpinner } from '../components/LoadingOverlay';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myProduce, setMyProduce] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [priceSearch, setPriceSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [newCrop, setNewCrop] = useState({
    cropName: '',
    category: 'vegetables',
    quantity: '',
    unit: 'kg',
    expectedPrice: '',
    quality: 'A',
    description: '',
    harvestDate: '',
    location: '',
    image: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser.role !== 'farmer') {
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
      const [profileRes, produceRes, pricesRes, schemesRes, ordersRes] = await Promise.all([
        api.get('/api/profile/me', cfg).catch(() => ({ data: { profile: null } })),
        api.get('/api/produce/my', cfg).catch(() => ({ data: { produce: [] } })),
        api.get('/api/market/prices', cfg).catch(() => ({ data: { prices: [] } })),
        api.get('/api/schemes', cfg).catch(() => ({ data: { schemes: [] } })),
        api.get('/api/orders/farmer', cfg).catch(() => ({ data: { orders: [] } }))
      ]);
      setProfile(profileRes.data.profile);
      setMyProduce(produceRes.data.produce || []);
      setMarketPrices(pricesRes.data.prices || []);
      setSchemes(schemesRes.data.schemes || []);
      setOrders(ordersRes.data.orders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    setActionLoading('addCrop');
    try {
      await api.post('/api/produce', newCrop);
      setShowAddCrop(false);
      setNewCrop({
        cropName: '', category: 'vegetables', quantity: '', unit: 'kg',
        expectedPrice: '', quality: 'A', description: '', harvestDate: '', location: '',
        image: ''
      });
      fetchData();
      setSuccessMsg('Crop added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error adding crop:', error);
      setError('Failed to add crop. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCrop = async (id) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      setActionLoading('delete-' + id);
      try {
        await api.delete(`/api/produce/${id}`);
        fetchData();
        setSuccessMsg('Crop deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (error) {
        console.error('Error deleting crop:', error);
        setError('Failed to delete crop.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleMarkSold = async (id) => {
    setActionLoading('sold-' + id);
    try {
      await api.patch(`/api/produce/${id}/sold`);
      fetchData();
      setSuccessMsg('Marked as sold!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error marking as sold:', error);
      setError('Failed to mark as sold.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOrderAction = async (orderId, status) => {
    setActionLoading('order-' + orderId);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      fetchData();
      setSuccessMsg(`Order ${status} successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating order:', error);
      setError('Failed to update order status.');
    } finally {
      setActionLoading(null);
    }
  };

  const activeListings = myProduce.filter(p => p.status === 'active').length;
  const soldListings = myProduce.filter(p => p.status === 'sold').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // Filtered market prices
  const filteredPrices = useMemo(() => {
    return marketPrices.filter(p => {
      const matchSearch = !priceSearch || p.commodity?.toLowerCase().includes(priceSearch.toLowerCase()) || p.market?.toLowerCase().includes(priceSearch.toLowerCase());
      const matchState = !selectedState || p.state === selectedState;
      return matchSearch && matchState;
    });
  }, [marketPrices, priceSearch, selectedState]);

  const uniqueStates = useMemo(() => {
    return [...new Set(marketPrices.map(p => p.state).filter(Boolean))].sort();
  }, [marketPrices]);

  if (loading) {
    return <LoadingOverlay show={true} fullPage={true} message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SuccessToast message={successMsg} onDismiss={() => setSuccessMsg('')} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ErrorBanner message={error} onDismiss={() => setError('')} />
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">{t('activeListings')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{activeListings}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">{t('cropsSold')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{soldListings}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">{t('pendingOrders')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{pendingOrders}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">{t('activeSchemes')}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{schemes.filter(s => s.status === 'Active').length}</p>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{t('profileSummary')}</h2>
                <button onClick={() => navigate('/profile')} className="text-green-600 hover:text-green-700 text-sm font-medium">
                  {t('editProfile')}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">{t('name')}</p>
                  <p className="font-semibold text-gray-800">{user?.name || t('notSet')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">{t('location')}</p>
                  <p className="font-semibold text-gray-800">{profile?.location ? (typeof profile.location === 'object' ? [profile.location.village, profile.location.district, profile.location.state].filter(Boolean).join(', ') : profile.location) : t('notSet')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">{t('farmSize')}</p>
                  <p className="font-semibold text-gray-800">{profile?.farmSize ? (typeof profile.farmSize === 'object' ? `${profile.farmSize.value || ''} ${profile.farmSize.unit || 'acres'}` : `${profile.farmSize} acres`) : t('notSet')}</p>
                </div>
              </div>
            </div>

            {/* Recent Market Prices */}
            {marketPrices.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{t('todaysMarketPrices')}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{t('sourceAGMARKNET')}</p>
                  </div>
                  <button onClick={() => navigate('/farmer-dashboard?tab=prices')} className="text-green-600 hover:text-green-700 text-sm font-medium">
                    {t('viewAll')} →
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {marketPrices.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center border border-green-100">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.commodity}</p>
                      <p className="text-lg font-bold text-green-700 mt-1">₹{item.modalPrice?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500">per {item.unit || 'Quintal'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            {orders.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                  <button onClick={() => navigate('/farmer-dashboard?tab=orders')} className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{order.produce?.cropName}</p>
                        <p className="text-sm text-gray-500">Buyer: {order.buyer?.name} | Qty: {order.quantity} {typeof order.produce?.unit === 'object' ? (order.produce?.unit?.unit || '') : (order.produce?.unit || '')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'packed' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Market Prices Tab */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{t('liveMarketPrices')}</h2>
                  <p className="text-sm text-gray-500">{t('realtimePrices')}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border">
                  {marketPrices.length} {t('commodities')}
                </span>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search commodity or market..."
                    value={priceSearch}
                    onChange={(e) => setPriceSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 bg-white min-w-[180px]"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              {filteredPrices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No matching prices found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Commodity</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Variety</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Market</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm hidden lg:table-cell">State</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Min (₹)</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Max (₹)</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Modal (₹)</th>
                        <th className="py-3 px-4 text-sm"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPrices.map((item, idx) => (
                        <tr key={idx} className="hover:bg-green-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-gray-800">{item.commodity}</span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 text-sm hidden md:table-cell">{item.variety || '-'}</td>
                          <td className="py-3.5 px-4 text-gray-600 text-sm">{item.market}</td>
                          <td className="py-3.5 px-4 text-gray-500 text-sm hidden lg:table-cell">{item.state}</td>
                          <td className="py-3.5 px-4 text-right text-gray-600 text-sm">₹{item.minPrice?.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4 text-right text-gray-600 text-sm">₹{item.maxPrice?.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-green-700">₹{item.modalPrice?.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <WhatsAppShareButton size="sm" onClick={() => shareMarketPrice(item)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4 text-center">
                Prices are in ₹ per Quintal • Source: AGMARKNET / e-NAM, Government of India • Updated daily
              </p>
            </div>
          </div>
        )}

        {/* My Crops Tab */}
        {activeTab === 'mycrops' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{t('myCropListings')}</h2>
              <button
                onClick={() => setShowAddCrop(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {t('addCrop')}
              </button>
            </div>

            {/* Add Crop Modal */}
            {showAddCrop && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">{t('postNewCrop')}</h3>
                      <button onClick={() => setShowAddCrop(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    
                    <form onSubmit={handleAddCrop} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('cropName')} *</label>
                        <input
                          type="text"
                          required
                          value={newCrop.cropName}
                          onChange={(e) => setNewCrop({...newCrop, cropName: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Wheat, Rice, Tomato"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={newCrop.category}
                            onChange={(e) => setNewCrop({...newCrop, category: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          >
                            <option value="vegetables">Vegetables</option>
                            <option value="fruits">Fruits</option>
                            <option value="grains">Grains</option>
                            <option value="pulses">Pulses</option>
                            <option value="spices">Spices</option>
                            <option value="oilseeds">Oilseeds</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                          <select
                            value={newCrop.quality}
                            onChange={(e) => setNewCrop({...newCrop, quality: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          >
                            <option value="A">Grade A (Premium)</option>
                            <option value="B">Grade B (Standard)</option>
                            <option value="C">Grade C (Economy)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                          <input
                            type="number"
                            required
                            value={newCrop.quantity}
                            onChange={(e) => setNewCrop({...newCrop, quantity: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                          <select
                            value={newCrop.unit}
                            onChange={(e) => setNewCrop({...newCrop, unit: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          >
                            <option value="kg">Kilogram (kg)</option>
                            <option value="quintal">Quintal</option>
                            <option value="ton">Ton</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Price (Rs.) *</label>
                        <input
                          type="number"
                          required
                          value={newCrop.expectedPrice}
                          onChange={(e) => setNewCrop({...newCrop, expectedPrice: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          placeholder="Enter price per unit"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                        <input
                          type="text"
                          required
                          value={newCrop.location}
                          onChange={(e) => setNewCrop({...newCrop, location: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., Thanjavur, Tamil Nadu"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newCrop.description}
                          onChange={(e) => setNewCrop({...newCrop, description: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          rows="3"
                          placeholder="Add details about quality, organic certification, etc."
                        />
                      </div>

                      <ImageUpload
                        value={newCrop.image}
                        onChange={(url) => setNewCrop({...newCrop, image: url})}
                      />

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddCrop(false)}
                          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium"
                        >
                          Post Crop
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Crop Listings */}
            {myProduce.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <h3 className="text-lg font-medium text-gray-800">No crops listed yet</h3>
                <p className="text-gray-500 mt-1 mb-4">Start selling by posting your first crop</p>
                <button
                  onClick={() => setShowAddCrop(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Post Your First Crop
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProduce.map((crop) => (
                  <div key={crop._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    {/* Product Image */}
                    {crop.image ? (
                      <div className="w-full h-44 overflow-hidden bg-gray-100">
                        <img
                          src={crop.image}
                          alt={crop.cropName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>'; }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                        <svg className="w-14 h-14 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{crop.cropName}</h3>
                          <p className="text-sm text-gray-500 capitalize">{crop.category}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          crop.status === 'active' ? 'bg-green-100 text-green-700' :
                          crop.status === 'sold' ? 'bg-green-200 text-green-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {crop.status?.charAt(0).toUpperCase() + crop.status?.slice(1)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="font-semibold text-gray-800">{crop.quantity} {typeof crop.unit === 'object' ? (crop.unit?.unit || 'quintal') : (crop.unit || 'quintal')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="font-semibold text-green-600">₹{crop.expectedPrice?.toLocaleString?.('en-IN') || crop.expectedPrice}/{typeof crop.unit === 'object' ? (crop.unit?.unit || 'quintal') : (crop.unit || 'quintal')}</p>
                        </div>
                      </div>

                      {crop.location && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span> {typeof crop.location === 'object' ? [crop.location.village, crop.location.district, crop.location.state].filter(Boolean).join(', ') : crop.location}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        {crop.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleMarkSold(crop._id)}
                              className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                            >
                              Mark Sold
                            </button>
                            <button
                              onClick={() => handleDeleteCrop(crop._id)}
                              className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        <WhatsAppShareButton
                          size="sm"
                          onClick={() => shareProduceListing({
                            name: crop.cropName,
                            price: crop.expectedPrice,
                            unit: typeof crop.unit === 'object' ? crop.unit?.unit || 'quintal' : crop.unit || 'quintal',
                            quantity: crop.quantity,
                            description: crop.description
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Incoming Orders</h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">No orders yet</h3>
                  <p className="text-gray-500 mt-1">Orders from buyers will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">{order.produce?.cropName}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Buyer: {order.buyer?.name} | Quantity: {order.quantity} {typeof order.produce?.unit === 'object' ? (order.produce?.unit?.unit || '') : (order.produce?.unit || '')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Date: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <p className="text-xl font-bold text-green-600">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'packed' ? 'bg-indigo-100 text-indigo-700' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                              order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                            {/* Payment Badge */}
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                              order.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-700' :
                              order.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-700' :
                              'bg-yellow-50 text-yellow-600'
                            }`}>
                              {order.paymentStatus === 'paid' ? 'Paid' :
                               order.paymentStatus === 'refunded' ? 'Refunded' :
                               order.paymentMethod === 'cod' ? 'COD' : 'Unpaid'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Action Buttons based on current status */}
                      {order.status === 'pending' && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleOrderAction(order._id, 'accepted')}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleOrderAction(order._id, 'rejected')}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {order.status === 'accepted' && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleOrderAction(order._id, 'packed')}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Mark as Packed
                          </button>
                        </div>
                      )}

                      {order.status === 'packed' && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleOrderAction(order._id, 'shipped')}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                            Mark as Shipped
                          </button>
                        </div>
                      )}

                      {order.status === 'shipped' && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleOrderAction(order._id, 'out_for_delivery')}
                            className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Mark Out for Delivery
                          </button>
                        </div>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <div className="mt-4">
                          <button
                            onClick={() => handleOrderAction(order._id, 'delivered')}
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark as Delivered
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

        {/* Government Schemes Tab */}
        {activeTab === 'schemes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Government Schemes for Farmers</h2>
              <p className="text-gray-500 text-sm mb-6">Latest schemes and subsidies from Government of India</p>

              {schemes.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">No schemes available</h3>
                  <p className="text-gray-500 mt-1">Government schemes will be displayed here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schemes.map((scheme, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-800">{scheme.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scheme.type === 'Subsidy' ? 'bg-green-100 text-green-700' :
                              scheme.type === 'Insurance' ? 'bg-blue-100 text-blue-700' :
                              scheme.type === 'Loan' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {scheme.type}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-2">{scheme.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                            {scheme.ministry && <span>Ministry: {scheme.ministry}</span>}
                            {scheme.deadline && <span>Deadline: {new Date(scheme.deadline).toLocaleDateString()}</span>}
                          </div>
                          {scheme.eligibility && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Eligibility:</span> {scheme.eligibility}
                            </p>
                          )}
                        </div>
                        <div className="flex sm:flex-col gap-2">
                          {scheme.link && (
                            <a
                              href={scheme.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                            >
                              Apply Now
                            </a>
                          )}
                        </div>
                      </div>
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

export default FarmerDashboard;
