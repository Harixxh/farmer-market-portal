import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../config/api'

const Home = () => {
  const [userName, setUserName] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [livePrices, setLivePrices] = useState([])

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    if (email) {
      setUserName(email.split('@')[0])
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)

    // Fetch live market prices from backend
    api.get('/api/market/prices')
      .then(res => {
        const prices = res.data.prices || [];
        setLivePrices(prices.slice(0, 5).map(p => ({
          name: p.commodity,
          market: p.market || p.state || '',
          price: p.modalPrice || 0,
          unit: p.unit || 'Quintal'
        })));
      })
      .catch(() => setLivePrices([]));

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const marketStats = [
    { label: 'Markets Tracked', value: '24', change: '+3 this week', positive: true },
    { label: 'Your Listings', value: '5', change: '2 active', positive: true },
    { label: 'Buyer Inquiries', value: '12', change: '+4 new', positive: true },
    { label: 'Scheme Alerts', value: '3', change: 'Action needed', positive: false },
  ]

  const demandForecast = [
    { crop: 'Wheat', demand: 'High', period: 'Next 30 days', recommendation: 'Good time to sell' },
    { crop: 'Rice', demand: 'Moderate', period: 'Next 30 days', recommendation: 'Hold if possible' },
    { crop: 'Cotton', demand: 'High', period: 'Next 15 days', recommendation: 'Sell now' },
  ]

  const recentActivity = [
    { type: 'inquiry', message: 'New inquiry for 50 quintal Wheat', time: '2 hours ago' },
    { type: 'price', message: 'Wheat price increased by 2.5% in Delhi', time: '5 hours ago' },
    { type: 'scheme', message: 'PM-KISAN installment deadline approaching', time: '1 day ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {userName || 'Farmer'}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {marketStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm mt-1 ${stat.positive ? 'text-green-600' : 'text-orange-600'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Market Prices */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Live Market Prices</h2>
                <p className="text-sm text-gray-500">Real-time prices from major mandis</p>
              </div>
              <Link to="/market" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View All Markets
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 text-sm font-medium text-gray-500">Crop</th>
                    <th className="text-left pb-3 text-sm font-medium text-gray-500">Market</th>
                    <th className="text-right pb-3 text-sm font-medium text-gray-500">Price/Quintal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {livePrices.length === 0 ? (
                    <tr><td colSpan={3} className="py-8 text-center text-gray-400">Loading prices...</td></tr>
                  ) : livePrices.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="py-3 text-gray-600">{item.market}</td>
                      <td className="py-3 text-right font-semibold text-green-700">₹{item.price?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-3">Source: AGMARKNET / e-NAM, Government of India</p>
            </div>
          </div>

          {/* Demand Forecast */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Demand Forecast</h2>
              <p className="text-sm text-gray-500">Market demand predictions</p>
            </div>
            <div className="space-y-4">
              {demandForecast.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.crop}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.demand === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.demand} Demand
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{item.period}</p>
                  <p className="text-sm font-medium text-green-600">{item.recommendation}</p>
                </div>
              ))}
            </div>
            <Link to="/market" className="block mt-4 text-center text-sm text-green-600 hover:text-green-700 font-medium">
              View Detailed Analysis
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'inquiry' ? 'bg-blue-500' :
                    activity.type === 'price' ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <div>
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/my-produce" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-medium text-green-700">Post Produce</span>
              </Link>
              <Link to="/market" className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium text-blue-700">View Prices</span>
              </Link>
              <Link to="/buyers" className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-medium text-purple-700">Find Buyers</span>
              </Link>
              <Link to="/schemes" className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium text-orange-700">Gov. Schemes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home