import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage, LANGUAGES } from '../context/LanguageContext'

const NavBar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    const user = localStorage.getItem('user')
    if (email) {
      setUserName(email.split('@')[0])
    }
    if (user) {
      const parsedUser = JSON.parse(user)
      setUserRole(parsedUser.role)
    }
  }, [])

  // SVG Icons for navigation
  const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )

  const MarketIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )

  const ProduceIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )

  const BuyersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )

  const SchemesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )

  const ProfileIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  const LogoutIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )

  const WeatherIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  )

  const OrdersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )

  const CartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  )

  // Define navigation links based on role
  // For farmer/buyer, all dashboard sections are tab-based links in the NavBar
  const getNavLinks = () => {
    if (userRole === 'farmer') {
      return [
        { path: '/farmer-dashboard', tab: 'overview', name: 'Overview', icon: <DashboardIcon /> },
        { path: '/farmer-dashboard', tab: 'prices', name: 'Market Prices', icon: <MarketIcon /> },
        { path: '/farmer-dashboard', tab: 'mycrops', name: 'My Crops', icon: <ProduceIcon /> },
        { path: '/farmer-dashboard', tab: 'orders', name: 'Orders', icon: <BuyersIcon /> },
        { path: '/farmer-dashboard', tab: 'schemes', name: 'Schemes', icon: <SchemesIcon /> },
        { path: '/weather', name: 'Weather', icon: <WeatherIcon /> },
      ]
    } else if (userRole === 'buyer') {
      return [
        { path: '/buyer-dashboard', tab: 'browse', name: 'Browse Crops', icon: <CartIcon /> },
        { path: '/buyer-dashboard', tab: 'prices', name: 'Market Prices', icon: <MarketIcon /> },
        { path: '/buyer-dashboard', tab: 'farmers', name: 'Farmers', icon: <BuyersIcon /> },
        { path: '/buyer-dashboard', tab: 'orders', name: 'My Orders', icon: <OrdersIcon /> },
        { path: '/weather', name: 'Weather', icon: <WeatherIcon /> },
      ]
    } else if (userRole === 'admin') {
      return [
        { path: '/admin', tab: 'overview', name: 'Overview', icon: <DashboardIcon /> },
        { path: '/admin', tab: 'users', name: 'Users', icon: <BuyersIcon /> },
        { path: '/admin', tab: 'produce', name: 'Produce', icon: <ProduceIcon /> },
        { path: '/admin', tab: 'orders', name: 'Orders', icon: <OrdersIcon /> },
        { path: '/admin', tab: 'market', name: 'Market Prices', icon: <MarketIcon /> },
        { path: '/admin', tab: 'schemes', name: 'Schemes', icon: <SchemesIcon /> },
        { path: '/admin', tab: 'payments', name: 'Payments', icon: <OrdersIcon /> },
      ]
    } else {
      return [
        { path: '/home', name: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/market', name: 'Market Prices', icon: <MarketIcon /> },
      ]
    }
  }

  const navLinks = getNavLinks()

  const isActive = (link) => {
    if (link.tab) {
      // Tab-based link: active when on the right path AND matching tab param (default to 'overview')
      const currentTab = searchParams.get('tab') || 'overview'
      return location.pathname === link.path && currentTab === link.tab
    }
    return location.pathname === link.path
  }

  const getLinkHref = (link) => {
    if (link.tab) return `${link.path}?tab=${link.tab}`
    return link.path
  }

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Get home path based on role
  const getHomePath = () => {
    if (userRole === 'admin') return '/admin'
    if (userRole === 'buyer') return '/buyer-dashboard'
    return '/farmer-dashboard'
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getHomePath()} className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="AgriMarket" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-green-700 hidden sm:block">AgriMarket</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                to={getLinkHref(link)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                <span className="hidden xl:inline">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                title={t('language')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.nativeLabel}</span>
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors flex items-center justify-between ${
                          language === lang.code ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.nativeLabel}</span>
                        <span className="text-xs text-gray-400">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <Link
              to="/profile"
              className={`hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/profile' ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-gray-700 font-medium text-sm hidden xl:inline">{userName || 'Profile'}</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              title="Logout"
            >
              <LogoutIcon />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                to={getLinkHref(link)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${
                  isActive(link)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${
                location.pathname === '/profile'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ProfileIcon />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar