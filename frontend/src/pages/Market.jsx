import React, { useState, useEffect, useMemo } from 'react'
import api from '../config/api'

const Market = () => {
  const [selectedState, setSelectedState] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [commodities, setCommodities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/market/prices')
      .then(res => {
        const prices = res.data.prices || [];
        setCommodities(prices.map((p, i) => ({
          id: i + 1,
          name: p.commodity,
          variety: p.variety || '',
          market: p.market || '',
          state: p.state || '',
          price: p.modalPrice || 0,
          high: p.maxPrice || 0,
          low: p.minPrice || 0,
          unit: p.unit || 'Quintal',
          source: p.source || ''
        })));
      })
      .catch(() => setCommodities([]))
      .finally(() => setLoading(false));
  }, []);

  const uniqueStates = useMemo(() => {
    return [...new Set(commodities.map(c => c.state).filter(Boolean))].sort();
  }, [commodities]);

  const filteredCommodities = useMemo(() => {
    return commodities
      .filter(c => !selectedState || c.state === selectedState)
      .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.market.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'price-low') return a.price - b.price
        return 0
      });
  }, [commodities, selectedState, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Market Prices</h1>
          <p className="text-gray-600 mt-1">Live commodity prices from AGMARKNET / e-NAM (Government of India)</p>
        </div>

        {/* Market Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Commodities</p>
            <p className="text-2xl font-bold text-gray-900">{commodities.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">States Covered</p>
            <p className="text-2xl font-bold text-green-600">{uniqueStates.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Showing</p>
            <p className="text-2xl font-bold text-blue-600">{filteredCommodities.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Data Source</p>
            <p className="text-sm font-bold text-gray-700 mt-1">AGMARKNET / e-NAM</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search commodities or markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            {/* State Filter */}
            <div className="flex-1 lg:max-w-xs">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex-1 lg:max-w-xs">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Commodities Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Commodity</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Market</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">State</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Modal (₹)</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Min (₹)</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Max (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCommodities.map((commodity) => (
                  <tr key={commodity.id} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-semibold">{commodity.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{commodity.name}</p>
                          {commodity.variety && <p className="text-xs text-gray-500">{commodity.variety}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{commodity.market}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{commodity.state}</td>
                    <td className="px-6 py-4 text-right font-bold text-green-700">
                      ₹{commodity.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">₹{commodity.low?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-gray-600">₹{commodity.high?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredCommodities.map((commodity) => (
              <div key={commodity.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold">{commodity.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{commodity.name}</p>
                      <p className="text-xs text-gray-500">{commodity.market}, {commodity.state}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-700 text-lg">₹{commodity.price?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Range</span>
                  <span className="text-gray-600">₹{commodity.low?.toLocaleString('en-IN')} - ₹{commodity.high?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredCommodities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No commodities found matching your criteria</p>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Prices in ₹ per Quintal • Source: AGMARKNET / e-NAM, Government of India • Updated daily
        </div>
      </div>
    </div>
  )
}

export default Market
