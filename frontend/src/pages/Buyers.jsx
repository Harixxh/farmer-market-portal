import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileAPI, produceAPI, orderAPI } from '../config/api'

const Buyers = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('buyers')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buyers, setBuyers] = useState([])
  const [marketplace, setMarketplace] = useState([])
  const [selectedProduce, setSelectedProduce] = useState(null)
  const [orderForm, setOrderForm] = useState({
    quantity: '',
    message: '',
    deliveryAddress: ''
  })
  const [placingOrder, setPlacingOrder] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch buyers list
      const buyersRes = await profileAPI.getAllBuyers()
      if (buyersRes.data.success) {
        setBuyers(buyersRes.data.buyers)
      }

      // Fetch marketplace produce
      const produceRes = await produceAPI.getMarketplace()
      if (produceRes.data.success) {
        setMarketplace(produceRes.data.produce)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!selectedProduce) return

    try {
      setPlacingOrder(true)
      const response = await orderAPI.create({
        produceId: selectedProduce._id,
        quantity: parseFloat(orderForm.quantity),
        message: orderForm.message,
        deliveryAddress: orderForm.deliveryAddress
      })

      if (response.data.success) {
        alert('Order placed successfully! The farmer will review your request.')
        setSelectedProduce(null)
        setOrderForm({ quantity: '', message: '', deliveryAddress: '' })
      }
    } catch (err) {
      console.error('Error placing order:', err)
      setError(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  // SVG Icons
  const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  const BuildingIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )

  const LocationIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

  const PackageIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )

  const VerifiedIcon = () => (
    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )

  const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  const tabs = [
    { id: 'buyers', name: 'Verified Buyers', icon: <UserIcon /> },
    { id: 'marketplace', name: 'Marketplace', icon: <PackageIcon /> },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Buyers and Marketplace</h1>
          <p className="text-gray-500 mt-1">Connect with verified buyers or browse available produce</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Buyers Tab */}
        {activeTab === 'buyers' && (
          <div>
            {buyers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No buyers registered yet</h3>
                <p className="mt-2 text-gray-500">Buyers will appear here once they register on the platform</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buyers.map((buyer) => (
                  <div key={buyer._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-blue-600">
                            {buyer.name?.charAt(0).toUpperCase() || 'B'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">{buyer.name}</h3>
                            {buyer.profile?.verified && <VerifiedIcon />}
                          </div>
                          {buyer.profile?.businessName && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <BuildingIcon /> {buyer.profile.businessName}
                            </p>
                          )}
                          {buyer.profile?.location?.state && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <LocationIcon /> {buyer.profile.location.state}, {buyer.profile.location.district}
                            </p>
                          )}
                        </div>
                      </div>

                      {buyer.profile?.businessType && (
                        <div className="mt-4">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {buyer.profile.businessType.charAt(0).toUpperCase() + buyer.profile.businessType.slice(1)}
                          </span>
                        </div>
                      )}

                      {buyer.profile?.interestedCommodities?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 mb-2">Interested in:</p>
                          <div className="flex flex-wrap gap-1">
                            {buyer.profile.interestedCommodities.slice(0, 4).map((item, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {item}
                              </span>
                            ))}
                            {buyer.profile.interestedCommodities.length > 4 && (
                              <span className="px-2 py-1 text-gray-500 text-xs">
                                +{buyer.profile.interestedCommodities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Member since {new Date(buyer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div>
            {marketplace.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageIcon />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No produce available</h3>
                <p className="mt-2 text-gray-500">Check back later for available produce listings</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplace.map((item) => (
                  <div key={item._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{item.cropName}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.quality === 'A' ? 'bg-green-100 text-green-700' :
                          item.quality === 'B' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          Grade {item.quality}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Available</span>
                          <span className="font-medium text-gray-900">{item.quantity} {item.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Price</span>
                          <span className="font-medium text-green-600">Rs {item.expectedPrice?.toLocaleString()}/{item.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Seller</span>
                          <span className="font-medium text-gray-900">{item.farmer?.name || 'Farmer'}</span>
                        </div>
                        {item.location?.state && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Location</span>
                            <span className="font-medium text-gray-900">{item.location.state}</span>
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                      )}

                      <button
                        onClick={() => setSelectedProduce(item)}
                        className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Modal */}
        {selectedProduce && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Place Order</h2>
                <button onClick={() => setSelectedProduce(null)} className="text-gray-400 hover:text-gray-600">
                  <CloseIcon />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900">{selectedProduce.cropName}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-600">Available: {selectedProduce.quantity} {selectedProduce.unit}</p>
                    <p className="text-green-600 font-medium">Rs {selectedProduce.expectedPrice?.toLocaleString()}/{selectedProduce.unit}</p>
                    <p className="text-gray-600">Seller: {selectedProduce.farmer?.name}</p>
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity ({selectedProduce.unit})
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedProduce.quantity}
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                      placeholder={`Max: ${selectedProduce.quantity}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                    {orderForm.quantity && (
                      <p className="mt-2 text-sm text-gray-600">
                        Total: Rs {(parseFloat(orderForm.quantity) * selectedProduce.expectedPrice).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <textarea
                      rows={2}
                      value={orderForm.deliveryAddress}
                      onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                      placeholder="Enter your delivery address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message to Seller (Optional)</label>
                    <textarea
                      rows={2}
                      value={orderForm.message}
                      onChange={(e) => setOrderForm({...orderForm, message: e.target.value})}
                      placeholder="Any special requirements or questions?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedProduce(null)}
                      className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={placingOrder}
                      className="flex-1 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {placingOrder ? 'Placing...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Buyers
