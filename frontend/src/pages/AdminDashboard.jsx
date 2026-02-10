import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [produce, setProduce] = useState([]);
  const [orders, setOrders] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [priceSearch, setPriceSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalProduce: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddScheme, setShowAddScheme] = useState(false);
  const [newScheme, setNewScheme] = useState({
    name: '',
    description: '',
    type: 'Subsidy',
    ministry: '',
    eligibility: '',
    deadline: '',
    link: '',
    status: 'Active'
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser.role !== 'admin') {
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
      const [usersRes, produceRes, ordersRes, schemesRes, pricesRes] = await Promise.all([
        api.get('/api/admin/users', cfg).catch(() => ({ data: { users: [] } })),
        api.get('/api/admin/produce', cfg).catch(() => ({ data: { produce: [] } })),
        api.get('/api/admin/orders', cfg).catch(() => ({ data: { orders: [] } })),
        api.get('/api/schemes', cfg).catch(() => ({ data: { schemes: [] } })),
        api.get('/api/market/prices', cfg).catch(() => ({ data: { prices: [] } }))
      ]);
      
      const usersData = usersRes.data.users || [];
      const produceData = produceRes.data.produce || [];
      const ordersData = ordersRes.data.orders || [];
      const schemesData = schemesRes.data.schemes || [];
      
      setUsers(usersData);
      setProduce(produceData);
      setOrders(ordersData);
      setSchemes(schemesData);
      setMarketPrices(pricesRes.data.prices || []);
      
      setStats({
        totalUsers: usersData.length,
        totalFarmers: usersData.filter(u => u.role === 'farmer').length,
        totalBuyers: usersData.filter(u => u.role === 'buyer').length,
        totalProduce: produceData.length,
        totalOrders: ordersData.length,
        pendingOrders: ordersData.filter(o => o.status === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, blocked) => {
    try {
      await api.patch(`/api/admin/users/${userId}/block`, { blocked });
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role });
      fetchData();
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteProduce = async (produceId) => {
    if (!window.confirm('Are you sure you want to delete this produce listing?')) return;
    try {
      await api.delete(`/api/admin/produce/${produceId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting produce:', error);
    }
  };

  const handleAddScheme = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/schemes', newScheme);
      setShowAddScheme(false);
      setNewScheme({
        name: '', description: '', type: 'Subsidy', ministry: '',
        eligibility: '', deadline: '', link: '', status: 'Active'
      });
      fetchData();
    } catch (error) {
      console.error('Error adding scheme:', error);
      alert('Failed to add scheme');
    }
  };

  const handleDeleteScheme = async (schemeId) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      await api.delete(`/api/schemes/${schemeId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting scheme:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Farmers</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalFarmers}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Buyers</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalBuyers}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Total Produce</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalProduce}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingOrders}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/admin?tab=users')}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <p className="font-medium text-gray-800">{t('userManagement')}</p>
                  <p className="text-sm text-gray-500 mt-1">View and manage all users</p>
                </button>
                <button
                  onClick={() => navigate('/admin?tab=produce')}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <p className="font-medium text-gray-800">{t('produceListings')}</p>
                  <p className="text-sm text-gray-500 mt-1">Monitor crop listings</p>
                </button>
                <button
                  onClick={() => navigate('/admin?tab=orders')}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <p className="font-medium text-gray-800">{t('allOrders')}</p>
                  <p className="text-sm text-gray-500 mt-1">Track all transactions</p>
                </button>
                <button
                  onClick={() => { navigate('/admin?tab=schemes'); setShowAddScheme(true); }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <p className="font-medium text-gray-800">{t('addScheme')}</p>
                  <p className="text-sm text-gray-500 mt-1">Add new govt scheme</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
                  <button onClick={() => navigate('/admin?tab=users')} className="text-green-600 hover:text-green-700 text-sm font-medium">
                    {t('viewAll')}
                  </button>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.role === 'admin' ? 'bg-green-100 text-green-700' :
                        u.role === 'farmer' ? 'bg-green-100 text-green-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                  <button onClick={() => navigate('/admin?tab=orders')} className="text-green-600 hover:text-green-700 text-sm font-medium">
                    {t('viewAll')}
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{order.produce?.cropName}</p>
                        <p className="text-sm text-gray-500">
                          {order.buyer?.name} - {order.quantity} {typeof order.produce?.unit === 'object' ? (order.produce?.unit?.unit || '') : (order.produce?.unit || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">Rs.{order.totalAmount?.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">User Management</h2>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">No users found</h3>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{u.email}</td>
                          <td className="py-4 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u._id, e.target.value)}
                              disabled={u.role === 'admin'}
                              className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-50"
                            >
                              <option value="farmer">Farmer</option>
                              <option value="buyer">Buyer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {u.blocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {u.role !== 'admin' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBlockUser(u._id, !u.blocked)}
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    u.blocked
                                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                      : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                  }`}
                                >
                                  {u.blocked ? 'Unblock' : 'Block'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="px-3 py-1 rounded text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Produce Tab */}
        {activeTab === 'produce' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Produce Listings</h2>

              {produce.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">No produce listings</h3>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Crop</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Farmer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produce.map((item) => (
                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-800">{item.cropName}</td>
                          <td className="py-4 px-4 text-gray-600">{item.farmer?.name}</td>
                          <td className="py-4 px-4 text-gray-600 capitalize">{item.category}</td>
                          <td className="py-4 px-4 text-right text-gray-600">{item.quantity} {typeof item.unit === 'object' ? (item.unit?.unit || 'quintal') : (item.unit || 'quintal')}</td>
                          <td className="py-4 px-4 text-right font-semibold text-green-600">Rs.{item.expectedPrice}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === 'active' ? 'bg-green-100 text-green-700' :
                              item.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleDeleteProduce(item._id)}
                              className="px-3 py-1 rounded text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">All Orders</h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">No orders found</h3>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Crop</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Buyer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Farmer</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-600 font-mono text-sm">
                            {order._id?.slice(-8).toUpperCase()}
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-800">{order.produce?.cropName}</td>
                          <td className="py-4 px-4 text-gray-600">{order.buyer?.name}</td>
                          <td className="py-4 px-4 text-gray-600">{order.produce?.farmer?.name || order.farmer?.name}</td>
                          <td className="py-4 px-4 text-right font-semibold text-green-600">
                            Rs.{order.totalAmount?.toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Market Prices Tab */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Market Prices Overview</h2>
                  <p className="text-sm text-gray-500">Real-time commodity prices from AGMARKNET / e-NAM (Government of India)</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border">
                  {marketPrices.length} commodities tracked
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
                  {[...new Set(marketPrices.map(p => p.state).filter(Boolean))].sort().map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const filtered = marketPrices.filter(p => {
                  const matchSearch = !priceSearch || p.commodity?.toLowerCase().includes(priceSearch.toLowerCase()) || p.market?.toLowerCase().includes(priceSearch.toLowerCase());
                  const matchState = !selectedState || p.state === selectedState;
                  return matchSearch && matchState;
                });
                return filtered.length === 0 ? (
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
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Variety</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Market</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">State</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Min (₹)</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Max (₹)</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Modal (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filtered.map((item, idx) => (
                          <tr key={idx} className="hover:bg-green-50/30 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-gray-800">{item.commodity}</td>
                            <td className="py-3.5 px-4 text-gray-500 text-sm">{item.variety || '-'}</td>
                            <td className="py-3.5 px-4 text-gray-600 text-sm">{item.market}</td>
                            <td className="py-3.5 px-4 text-gray-500 text-sm">{item.state}</td>
                            <td className="py-3.5 px-4 text-right text-gray-600 text-sm">₹{item.minPrice?.toLocaleString('en-IN')}</td>
                            <td className="py-3.5 px-4 text-right text-gray-600 text-sm">₹{item.maxPrice?.toLocaleString('en-IN')}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-green-700">₹{item.modalPrice?.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              <p className="text-xs text-gray-400 mt-4 text-center">
                Prices in ₹ per Quintal • Source: AGMARKNET / e-NAM, Government of India • Updated daily
              </p>
            </div>
          </div>
        )}

        {/* Government Schemes Tab */}
        {activeTab === 'schemes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Government Schemes</h2>
              <button
                onClick={() => setShowAddScheme(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Add Scheme
              </button>
            </div>

            {/* Add Scheme Modal */}
            {showAddScheme && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Add Government Scheme</h3>
                      <button onClick={() => setShowAddScheme(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    
                    <form onSubmit={handleAddScheme} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
                        <input
                          type="text"
                          required
                          value={newScheme.name}
                          onChange={(e) => setNewScheme({...newScheme, name: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., PM Kisan Samman Nidhi"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                          required
                          value={newScheme.description}
                          onChange={(e) => setNewScheme({...newScheme, description: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          rows="3"
                          placeholder="Brief description of the scheme"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={newScheme.type}
                            onChange={(e) => setNewScheme({...newScheme, type: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          >
                            <option value="Subsidy">Subsidy</option>
                            <option value="Loan">Loan</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Training">Training</option>
                            <option value="Support">Support</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={newScheme.status}
                            onChange={(e) => setNewScheme({...newScheme, status: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          >
                            <option value="Active">Active</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ministry</label>
                        <input
                          type="text"
                          value={newScheme.ministry}
                          onChange={(e) => setNewScheme({...newScheme, ministry: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          placeholder="e.g., Ministry of Agriculture"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                        <input
                          type="text"
                          value={newScheme.eligibility}
                          onChange={(e) => setNewScheme({...newScheme, eligibility: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          placeholder="Who can apply for this scheme"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input
                          type="date"
                          value={newScheme.deadline}
                          onChange={(e) => setNewScheme({...newScheme, deadline: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Official Link</label>
                        <input
                          type="url"
                          value={newScheme.link}
                          onChange={(e) => setNewScheme({...newScheme, link: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddScheme(false)}
                          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium"
                        >
                          Add Scheme
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Schemes List */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              {schemes.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-800">No schemes added</h3>
                  <p className="text-gray-500 mt-1">Click "Add Scheme" to add a new government scheme</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schemes.map((scheme) => (
                    <div key={scheme._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-800">{scheme.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scheme.type === 'Subsidy' ? 'bg-green-100 text-green-700' :
                              scheme.type === 'Insurance' ? 'bg-green-100 text-green-700' :
                              scheme.type === 'Loan' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {scheme.type}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scheme.status === 'Active' ? 'bg-green-100 text-green-700' :
                              scheme.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {scheme.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-2">{scheme.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                            {scheme.ministry && <span>Ministry: {scheme.ministry}</span>}
                            {scheme.deadline && <span>Deadline: {new Date(scheme.deadline).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {scheme.link && (
                            <a
                              href={scheme.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              View
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteScheme(scheme._id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
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

export default AdminDashboard;
