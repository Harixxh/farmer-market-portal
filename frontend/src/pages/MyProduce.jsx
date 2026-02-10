import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { produceAPI } from '../config/api'

const MyProduce = () => {
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProduce, setSelectedProduce] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ total: 0, active: 0, sold: 0 })

  const [newProduce, setNewProduce] = useState({
    cropName: '',
    category: '',
    quantity: '',
    unit: 'quintal',
    expectedPrice: '',
    quality: 'A',
    harvestDate: '',
    description: '',
    availableUntil: '',
    location: { state: '', district: '' }
  })

  const [myListings, setMyListings] = useState([])

  const categories = [
    { id: 'grains', name: 'Grains and Cereals' },
    { id: 'pulses', name: 'Pulses' },
    { id: 'oilseeds', name: 'Oil Seeds' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'spices', name: 'Spices' },
  ]

  const qualityGrades = [
    { id: 'A', name: 'Grade A - Premium' },
    { id: 'B', name: 'Grade B - Good' },
    { id: 'C', name: 'Grade C - Standard' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchMyProduce()
    fetchStats()
  }, [])

  const fetchMyProduce = async () => {
    try {
      setLoading(true)
      const response = await produceAPI.getMyProduce()
      if (response.data.success) {
        setMyListings(response.data.produce)
      }
    } catch (err) {
      console.error('Error fetching produce:', err)
      setError('Failed to load your produce listings')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await produceAPI.getStats()
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const filteredListings = myListings.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  const handleAddProduce = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      
      const produceData = {
        ...newProduce,
        quantity: parseFloat(newProduce.quantity),
        expectedPrice: parseFloat(newProduce.expectedPrice)
      }

      const response = await produceAPI.create(produceData)
      
      if (response.data.success) {
        setMyListings([response.data.produce, ...myListings])
        setShowAddForm(false)
        setNewProduce({
          cropName: '',
          category: '',
          quantity: '',
          unit: 'quintal',
          expectedPrice: '',
          quality: 'A',
          harvestDate: '',
          description: '',
          availableUntil: '',
          location: { state: '', district: '' }
        })
        fetchStats()
        alert('Produce added successfully!')
      }
    } catch (err) {
      console.error('Error adding produce:', err)
      setError(err.response?.data?.message || 'Failed to add produce')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAsSold = async (id) => {
    try {
      const response = await produceAPI.markAsSold(id)
      if (response.data.success) {
        setMyListings(myListings.map(item => 
          item._id === id ? { ...item, status: 'sold' } : item
        ))
        fetchStats()
      }
    } catch (err) {
      console.error('Error marking as sold:', err)
      setError('Failed to update status')
    }
  }

  const handleDeleteProduce = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    
    try {
      const response = await produceAPI.delete(id)
      if (response.data.success) {
        setMyListings(myListings.filter(item => item._id !== id))
        fetchStats()
        alert('Produce deleted successfully')
      }
    } catch (err) {
      console.error('Error deleting produce:', err)
      setError('Failed to delete produce')
    }
  }

  // SVG Icons
  const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )

  const PackageIcon = () => (
    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )

  const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

  const ChatIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )

  const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Produce Listings</h1>
            <p className="text-gray-500 mt-1">Manage your crop listings and track buyer interest</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <PlusIcon />
            Add New Produce
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || myListings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active || myListings.filter(l => l.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sold</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sold || myListings.filter(l => l.status === 'sold').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'active', 'sold', 'expired'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <PackageIcon />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No listings found</h3>
            <p className="mt-2 text-gray-500">
              {filter === 'all' 
                ? 'Start by adding your first produce listing'
                : `No ${filter} listings at the moment`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add Your First Produce
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <div key={item._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{item.cropName}</h3>
                      <p className="text-sm text-gray-500">{categories.find(c => c.id === item.category)?.name || item.category}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' :
                      item.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity</span>
                      <span className="font-medium text-gray-900">{item.quantity} {item.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Expected Price</span>
                      <span className="font-medium text-green-600">Rs {item.expectedPrice?.toLocaleString()}/{item.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quality</span>
                      <span className="font-medium text-gray-900">Grade {item.quality}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location</span>
                      <span className="font-medium text-gray-900">{item.location?.state || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <EyeIcon /> {item.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ChatIcon /> {item.inquiries || 0} inquiries
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {item.status === 'active' && (
                      <>
                        <button
                          onClick={() => setSelectedProduce(item)}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleMarkAsSold(item._id)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                        >
                          Mark as Sold
                        </button>
                      </>
                    )}
                    {item.status !== 'active' && (
                      <button
                        onClick={() => setSelectedProduce(item)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProduce(item._id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Produce Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Add New Produce</h2>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleAddProduce} className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name</label>
                    <input
                      type="text"
                      required
                      value={newProduce.cropName}
                      onChange={(e) => setNewProduce({...newProduce, cropName: e.target.value})}
                      placeholder="e.g., Wheat, Rice, Cotton"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      required
                      value={newProduce.category}
                      onChange={(e) => setNewProduce({...newProduce, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={newProduce.quantity}
                        onChange={(e) => setNewProduce({...newProduce, quantity: e.target.value})}
                        placeholder="Enter quantity"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                      <select
                        value={newProduce.unit}
                        onChange={(e) => setNewProduce({...newProduce, unit: e.target.value})}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      >
                        <option value="quintal">Quintal</option>
                        <option value="kg">Kg</option>
                        <option value="ton">Ton</option>
                        <option value="pieces">Pieces</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price (per unit)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rs</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newProduce.expectedPrice}
                        onChange={(e) => setNewProduce({...newProduce, expectedPrice: e.target.value})}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quality Grade</label>
                    <select
                      value={newProduce.quality}
                      onChange={(e) => setNewProduce({...newProduce, quality: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                      {qualityGrades.map(grade => (
                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
                    <input
                      type="date"
                      value={newProduce.harvestDate}
                      onChange={(e) => setNewProduce({...newProduce, harvestDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Until</label>
                    <input
                      type="date"
                      value={newProduce.availableUntil}
                      onChange={(e) => setNewProduce({...newProduce, availableUntil: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={newProduce.location.state}
                      onChange={(e) => setNewProduce({...newProduce, location: {...newProduce.location, state: e.target.value}})}
                      placeholder="e.g., Punjab"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <input
                      type="text"
                      value={newProduce.location.district}
                      onChange={(e) => setNewProduce({...newProduce, location: {...newProduce.location, district: e.target.value}})}
                      placeholder="e.g., Ludhiana"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={newProduce.description}
                    onChange={(e) => setNewProduce({...newProduce, description: e.target.value})}
                    placeholder="Describe your produce quality, storage conditions, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Adding...' : 'Add Produce'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {selectedProduce && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">{selectedProduce.cropName}</h2>
                <button onClick={() => setSelectedProduce(null)} className="text-gray-400 hover:text-gray-600">
                  <CloseIcon />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{categories.find(c => c.id === selectedProduce.category)?.name || selectedProduce.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedProduce.status === 'active' ? 'bg-green-100 text-green-700' :
                      selectedProduce.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedProduce.status?.charAt(0).toUpperCase() + selectedProduce.status?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-900">{selectedProduce.quantity} {selectedProduce.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Price</p>
                    <p className="font-medium text-green-600">Rs {selectedProduce.expectedPrice?.toLocaleString()}/{selectedProduce.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quality</p>
                    <p className="font-medium text-gray-900">Grade {selectedProduce.quality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{selectedProduce.location?.state || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Harvest Date</p>
                    <p className="font-medium text-gray-900">{selectedProduce.harvestDate ? new Date(selectedProduce.harvestDate).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Until</p>
                    <p className="font-medium text-gray-900">{selectedProduce.availableUntil ? new Date(selectedProduce.availableUntil).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                </div>
                {selectedProduce.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{selectedProduce.description}</p>
                  </div>
                )}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-gray-500">
                    <EyeIcon /> <span className="text-sm">{selectedProduce.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <ChatIcon /> <span className="text-sm">{selectedProduce.inquiries || 0} inquiries</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={() => setSelectedProduce(null)}
                  className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
                {selectedProduce.status === 'active' && (
                  <button
                    onClick={() => {
                      handleMarkAsSold(selectedProduce._id)
                      setSelectedProduce(null)
                    }}
                    className="flex-1 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    Mark as Sold
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProduce
