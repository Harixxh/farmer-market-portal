import React from 'react'
import { Link } from 'react-router-dom'

const FrontPage = () => {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Navigation */}
      <nav className="flex items-center justify-center px-4 sm:px-6 lg:px-16 py-4 lg:py-6">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="AgriMarket Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-green-700 leading-tight">AgriMarket</span>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Farmer Intelligence Portal</span>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image Background */}
      <section className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80" 
            alt="Golden wheat field" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-16 py-24 sm:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Smart Market Intelligence
              <span className="block mt-2">for Modern Farmers</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
              Real-time prices, weather insights, and direct buyer connections — everything you need to grow your agricultural business.
            </p>
            <Link 
              to="/login" 
              className="inline-block px-10 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-16 py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-black text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Live Market Prices</h3>
              <p className="text-sm text-gray-600">Track commodity prices across markets in real-time.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Weather Forecasts</h3>
              <p className="text-sm text-gray-600">Accurate weather data to plan your farming activities.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Buyer Network</h3>
              <p className="text-sm text-gray-600">Connect directly with verified buyers for better prices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-16 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="AgriMarket Logo" className="w-9 h-9 object-contain" />
            <span className="font-semibold text-green-700">AgriMarket</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 AgriMarket. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default FrontPage