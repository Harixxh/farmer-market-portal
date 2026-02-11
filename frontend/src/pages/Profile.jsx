import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileAPI, orderAPI } from '../config/api'

const Profile = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: { state: '', district: '', village: '', city: '', address: '' },
    farmSizeValue: '',
    farmSizeUnit: 'acres',
    crops: [],
    businessName: '',
    businessType: '',
    gstNumber: '',
    interestedCommodities: [],
    minOrderQuantity: '',
    // Farmer fields
    upiId: '',
    upiPhoneNumber: '',
    // Buyer fields
    shippingAddresses: []
  })
  const [stats, setStats] = useState({
    totalProduce: 0,
    activeProduce: 0,
    soldProduce: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    totalOrders: 0
  })
  const [orders, setOrders] = useState([])
  const [newCrop, setNewCrop] = useState('')
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'home',
    isDefault: false
  })
  const [isAddingAddress, setIsAddingAddress] = useState(false)

  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    weatherAlerts: true,
    buyerMessages: true,
    newsletter: false,
    smsAlerts: true,
    emailAlerts: true
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showTwoFAModal, setShowTwoFAModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showTwoFAModal, setShowTwoFAModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const profileRes = await profileAPI.getProfile()
      
      if (profileRes.data.success) {
        const userData = profileRes.data.user
        const profileData = profileRes.data.profile
        
        setUser(userData)
        
        const loc = profileData?.location || {}
        setProfile(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: profileData?.phone || '',
          location: {
            state: loc.state || '',
            district: loc.district || '',
            village: loc.village || '',
            city: loc.city || '',
            address: loc.address || ''
          },
          farmSizeValue: profileData?.farmSize?.value || '',
          farmSizeUnit: profileData?.farmSize?.unit || 'acres',
          crops: profileData?.crops || [],
          businessName: profileData?.businessName || '',
          businessType: profileData?.businessType || '',
          gstNumber: profileData?.gstNumber || '',
          interestedCommodities: profileData?.interestedCommodities || [],
          minOrderQuantity: profileData?.minOrderQuantity || '',
          // Farmer fields
          upiId: profileData?.upiDetails?.upiId || '',
          upiPhoneNumber: profileData?.upiDetails?.phoneNumber || '',
          // Buyer fields
          shippingAddresses: profileData?.shippingAddresses || []
        }))

        // Load notification preferences
        if (profileData?.notificationPreferences) {
          setNotifications(profileData.notificationPreferences)
        }
        
        // Load security settings
        if (profileData?.twoFactorEnabled) {
          setTwoFAEnabled(profileData.twoFactorEnabled)
        }

        // Fetch stats based on role
        if (userData.role === 'farmer') {
          const statsRes = await profileAPI.getFarmerStats()
          if (statsRes.data.success) {
            setStats(statsRes.data.stats)
          }
          const ordersRes = await orderAPI.getFarmerOrders()
          if (ordersRes.data.success) {
            setOrders(ordersRes.data.orders)
          }
        } else if (userData.role === 'buyer') {
          const statsRes = await profileAPI.getBuyerStats()
          if (statsRes.data.success) {
            setStats(statsRes.data.stats)
          }
          const ordersRes = await orderAPI.getBuyerOrders()
          if (ordersRes.data.success) {
            setOrders(ordersRes.data.orders)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile data')
      if (err.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userEmail')
    navigate('/login')
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError('')

      // Update basic info
      await profileAPI.updateBasicInfo({ name: profile.name, email: profile.email })

      // Update role-specific profile
      if (user?.role === 'farmer') {
        await profileAPI.updateFarmerProfile({
          phone: profile.phone,
          location: {
            state: profile.location.state,
            district: profile.location.district,
            village: profile.location.village
          },
          farmSize: {
            value: parseFloat(profile.farmSizeValue) || 0,
            unit: profile.farmSizeUnit || 'acres'
          },
          crops: profile.crops,
          upiDetails: {
            upiId: profile.upiId,
            phoneNumber: profile.upiPhoneNumber
          }
        })
      } else if (user?.role === 'buyer') {
        await profileAPI.updateBuyerProfile({
          phone: profile.phone,
          location: {
            state: profile.location.state,
            city: profile.location.city,
            address: profile.location.address
          },
          businessName: profile.businessName,
          businessType: profile.businessType,
          gstNumber: profile.gstNumber,
          interestedCommodities: profile.interestedCommodities,
          minOrderQuantity: profile.minOrderQuantity,
          shippingAddresses: profile.shippingAddresses
        })
      }

      // Update localStorage so NavBar and other components reflect changes
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      storedUser.name = profile.name
      localStorage.setItem('user', JSON.stringify(storedUser))

      // Re-fetch all profile data from DB to show latest values
      await fetchProfileData()

      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const addCrop = () => {
    if (newCrop.trim() && !profile.crops.includes(newCrop.trim())) {
      setProfile(prev => ({
        ...prev,
        crops: [...prev.crops, newCrop.trim()]
      }))
      setNewCrop('')
    }
  }

  const removeCrop = (cropToRemove) => {
    setProfile(prev => ({
      ...prev,
      crops: prev.crops.filter(crop => crop !== cropToRemove)
    }))
  }

  const handleAddAddress = () => {
    if (newAddress.name.trim() && newAddress.phone.trim() && newAddress.addressLine1.trim() && 
        newAddress.city.trim() && newAddress.state.trim() && newAddress.pincode.trim()) {
      
      // If this is the first address or explicitly set as default, make it default
      const isFirstAddress = profile.shippingAddresses.length === 0
      const updatedAddress = { ...newAddress, isDefault: isFirstAddress || newAddress.isDefault }
      
      // If setting as default, unmark other addresses
      let updatedAddresses = profile.shippingAddresses
      if (updatedAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }))
      }
      
      setProfile(prev => ({
        ...prev,
        shippingAddresses: [...updatedAddresses, updatedAddress]
      }))
      
      // Reset the form
      setNewAddress({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        addressType: 'home',
        isDefault: false
      })
      setIsAddingAddress(false)
    }
  }

  const handleDeleteAddress = (index) => {
    const updatedAddresses = profile.shippingAddresses.filter((_, i) => i !== index)
    
    // If we deleted the default address and there are other addresses, make the first one default
    if (profile.shippingAddresses[index]?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true
    }
    
    setProfile(prev => ({
      ...prev,
      shippingAddresses: updatedAddresses
    }))
  }

  const handleSetDefaultAddress = (index) => {
    const updatedAddresses = profile.shippingAddresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }))
    
    setProfile(prev => ({
      ...prev,
      shippingAddresses: updatedAddresses
    }))
  }

  const handleNotificationChange = async (key, value) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)
    
    setSavingNotifications(true)
    try {
      // In a real app, you'd save to backend here
      // await api.put('/api/profile/notifications', { notifications: updatedNotifications })
      setTimeout(() => setSavingNotifications(false), 500)
    } catch (error) {
      console.error('Error saving notifications:', error)
      setNotifications(notifications)
      setError('Failed to save notification preferences')
      setSavingNotifications(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    try {
      // In a real app, you'd call the backend API here
      // await api.put('/api/profile/change-password', {
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // })
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccessMsg('Password changed successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password')
    }
  }

  const handleToggleTwoFA = async () => {
    try {
      if (twoFAEnabled) {
        setTwoFAEnabled(false)
        setSuccessMsg('Two-factor authentication disabled')
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setShowTwoFAModal(true)
      }
    } catch (error) {
      setError('Failed to update two-factor authentication')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // In a real app, you'd call the backend to delete the account
      // await api.delete('/api/profile/delete-account')
      alert('Account deletion functionality would be implemented here')
      setShowDeleteModal(false)
    } catch (error) {
      setError('Failed to delete account')
    }
  }

  const handleNotificationChange = async (key, value) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)
    
    setSavingNotifications(true)
    try {
      await api.put('/api/profile/notifications', { notifications: updatedNotifications })
    } catch (error) {
      console.error('Error saving notifications:', error)
      // Revert on error
      setNotifications(notifications)
      setError('Failed to save notification preferences')
    } finally {
      setSavingNotifications(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    try {
      await api.put('/api/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password changed successfully!')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password')
    }
  }

  const handleToggleTwoFA = async () => {
    try {
      if (twoFAEnabled) {
        await api.put('/api/profile/disable-2fa')
        setTwoFAEnabled(false)
        alert('Two-factor authentication disabled')
      } else {
        setShowTwoFAModal(true)
      }
    } catch (error) {
      setError('Failed to update two-factor authentication')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/api/profile/delete-account')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userEmail')
      navigate('/login')
    } catch (error) {
      setError('Failed to delete account')
    }
  }

  // SVG Icons
  const ChartIcon = () => (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )

  const BellIcon = () => (
    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )

  const CurrencyIcon = () => (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  const PackageIcon = () => (
    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )

  const LocationIcon = () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )

  const FarmIcon = () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  const CalendarIcon = () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )

  const getStatsData = () => {
    if (user.role === 'farmer') {
      return [
        { label: 'Total Produce', value: stats.totalProduce ?? 0, icon: <PackageIcon /> },
        { label: 'Active Listings', value: stats.activeProduce ?? 0, icon: <ChartIcon /> },
        { label: 'Pending Orders', value: stats.pendingOrders ?? 0, icon: <BellIcon /> },
        { label: 'Total Earnings', value: `₹${(stats.totalEarnings ?? 0).toLocaleString('en-IN')}`, icon: <CurrencyIcon /> },
      ]
    } else {
      return [
        { label: 'Total Orders', value: stats.totalOrders ?? 0, icon: <PackageIcon /> },
        { label: 'Pending Orders', value: stats.pendingOrders ?? 0, icon: <BellIcon /> },
        { label: 'Completed', value: stats.completedOrders ?? 0, icon: <ChartIcon /> },
        { label: 'Total Spent', value: `₹${(stats.totalSpent ?? 0).toLocaleString('en-IN')}`, icon: <CurrencyIcon /> },
      ]
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'orders', name: 'My Orders', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { id: 'notifications', name: 'Notifications', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )},
    { id: 'security', name: 'Security', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Failed to load profile'}</p>
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-green-600">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name || 'User'}</h1>
                {user.role && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'farmer' ? 'bg-green-100 text-green-700' : 
                    user.role === 'buyer' ? 'bg-blue-100 text-blue-700' : 
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-gray-500">{profile.email}</p>
              {profile.phone && (
                <p className="text-gray-500 text-sm">{profile.phone}</p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3">
                {profile.location?.state && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <LocationIcon /> {profile.location.state}{user.role === 'farmer' && profile.location.district ? `, ${profile.location.district}` : ''}{user.role === 'buyer' && profile.location.city ? `, ${profile.location.city}` : ''}
                  </span>
                )}
                {user.role === 'farmer' && profile.farmSizeValue && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <FarmIcon /> {profile.farmSizeValue} {profile.farmSizeUnit}
                  </span>
                )}
                {user.role === 'buyer' && profile.businessName && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <FarmIcon /> {profile.businessName}
                  </span>
                )}
                {user.createdAt && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <CalendarIcon /> Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {getStatsData().map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

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

        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={saving}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={profile.location?.state || ''}
                  onChange={(e) => setProfile({...profile, location: {...profile.location, state: e.target.value}})}
                  disabled={!isEditing}
                  placeholder="Punjab"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              {user?.role === 'farmer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <input
                      type="text"
                      value={profile.location?.district || ''}
                      onChange={(e) => setProfile({...profile, location: {...profile.location, district: e.target.value}})}
                      disabled={!isEditing}
                      placeholder="Ludhiana"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                    <input
                      type="text"
                      value={profile.location?.village || ''}
                      onChange={(e) => setProfile({...profile, location: {...profile.location, village: e.target.value}})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </>
              )}
              {user?.role === 'buyer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={profile.location?.city || ''}
                      onChange={(e) => setProfile({...profile, location: {...profile.location, city: e.target.value}})}
                      disabled={!isEditing}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={profile.location?.address || ''}
                      onChange={(e) => setProfile({...profile, location: {...profile.location, address: e.target.value}})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </>
              )}

              {/* Farmer specific fields */}
              {user?.role === 'farmer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={profile.farmSizeValue}
                        onChange={(e) => setProfile({...profile, farmSizeValue: e.target.value})}
                        disabled={!isEditing}
                        placeholder="25"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      <select
                        value={profile.farmSizeUnit}
                        onChange={(e) => setProfile({...profile, farmSizeUnit: e.target.value})}
                        disabled={!isEditing}
                        className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="bigha">Bigha</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Crops</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.crops.map((crop, index) => (
                        <span key={index} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                          {crop}
                          {isEditing && (
                            <button onClick={() => removeCrop(crop)} className="ml-1 text-green-600 hover:text-green-800">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCrop}
                          onChange={(e) => setNewCrop(e.target.value)}
                          placeholder="Add a crop"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          onKeyDown={(e) => e.key === 'Enter' && addCrop()}
                        />
                        <button onClick={addCrop} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* UPI Details Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Payment Details (UPI)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                        <input
                          type="text"
                          value={profile.upiId}
                          onChange={(e) => setProfile({...profile, upiId: e.target.value})}
                          disabled={!isEditing}
                          placeholder="farmer@paytm | farmer@phonepay"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">UPI Registered Phone</label>
                        <input
                          type="tel"
                          value={profile.upiPhoneNumber}
                          onChange={(e) => setProfile({...profile, upiPhoneNumber: e.target.value})}
                          disabled={!isEditing}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-600 flex items-start gap-1">
                          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Your UPI details will be used by buyers to make direct payments for orders. Ensure your UPI ID is active and the phone number matches your UPI registration.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Buyer specific fields */}
              {user?.role === 'buyer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={profile.businessName}
                      onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <select
                      value={profile.businessType}
                      onChange={(e) => setProfile({...profile, businessType: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Select Type</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="retailer">Retailer</option>
                      <option value="exporter">Exporter</option>
                      <option value="processor">Processor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                    <input
                      type="text"
                      value={profile.gstNumber}
                      onChange={(e) => setProfile({...profile, gstNumber: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Quantity</label>
                    <input
                      type="text"
                      value={profile.minOrderQuantity}
                      onChange={(e) => setProfile({...profile, minOrderQuantity: e.target.value})}
                      disabled={!isEditing}
                      placeholder="e.g., 10 quintals"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  
                  {/* Shipping Addresses Section */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Shipping Addresses
                      </h3>
                      {isEditing && (
                        <button
                          onClick={() => setIsAddingAddress(true)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Address
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {profile.shippingAddresses.map((address, index) => (
                        <div key={index} className={`p-4 border rounded-lg ${address.isDefault ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{address.name}</span>
                                <span className="text-sm text-gray-600">({address.phone})</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  address.addressType === 'home' ? 'bg-blue-100 text-blue-700' :
                                  address.addressType === 'office' ? 'bg-purple-100 text-purple-700' : 
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {address.addressType}
                                </span>
                                {address.isDefault && (
                                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Default</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                                {address.landmark && `, ${address.landmark}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                            </div>
                            {isEditing && (
                              <div className="flex gap-2 ml-4">
                                {!address.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(index)}
                                    className="text-xs text-green-600 hover:text-green-800"
                                  >
                                    Set Default
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAddress(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {profile.shippingAddresses.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <p>No shipping addresses added yet</p>
                        </div>
                      )}
                      
                      {/* Add Address Form */}
                      {isEditing && isAddingAddress && (
                        <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <h4 className="font-medium text-gray-900 mb-3">Add New Address</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                              placeholder="Full Name"
                              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <input
                              type="tel"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                              placeholder="Phone Number"
                              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <input
                              type="text"
                              value={newAddress.addressLine1}
                              onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                              placeholder="Address Line 1"
                              className="col-span-2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <input
                              type="text"
                              value={newAddress.addressLine2}
                              onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                              placeholder="Address Line 2 (Optional)"
                              className="col-span-2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              placeholder="City"
                              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                              placeholder="State"
                              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <input
                              type="text"
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                              placeholder="Pincode"
                              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <input
                              type="text"
                              value={newAddress.landmark}
                              onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                              placeholder="Landmark (Optional)"
                              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            />
                            <select
                              value={newAddress.addressType}
                              onChange={(e) => setNewAddress({...newAddress, addressType: e.target.value})}
                              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            >
                              <option value="home">Home</option>
                              <option value="office">Office</option>
                              <option value="other">Other</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                              <input
                                type="checkbox"
                                checked={newAddress.isDefault}
                                onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                              />
                              Set as default
                            </label>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={handleAddAddress}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Save Address
                            </button>
                            <button
                              onClick={() => setIsAddingAddress(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">My Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Crop</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                        {user?.role === 'farmer' ? 'Buyer' : 'Farmer'}
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Quantity</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-600">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {order.produce?.cropName || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {user.role === 'farmer' ? (order.buyer?.name || 'N/A') : (order.farmer?.name || 'N/A')}
                        </td>
                        <td className="px-4 py-4 text-gray-600">{order.quantity} {order.unit}</td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-900">
                          ₹{(order.totalAmount ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: 'priceAlerts', label: 'Price Alerts', desc: 'Get notified when commodity prices change significantly' },
                { key: 'weatherAlerts', label: 'Weather Alerts', desc: 'Receive weather warnings and farming advisories' },
                { key: 'buyerMessages', label: 'Buyer Messages', desc: 'Notifications for new messages from buyers' },
                { key: 'newsletter', label: 'Weekly Newsletter', desc: 'Market insights and farming tips every week' },
                { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive important alerts via SMS' },
                { key: 'emailAlerts', label: 'Email Notifications', desc: 'Receive updates via email' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(item.key, !notifications[item.key])}
                    disabled={savingNotifications}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key] ? 'bg-green-600' : 'bg-gray-300'
                    } ${savingNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications[item.key] ? 'left-7' : 'left-1'
                    }`}></span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your password regularly for security</p>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add extra security to your account</p>
                  </div>
                  <button 
                    onClick={handleToggleTwoFA}
                    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                      twoFAEnabled 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {twoFAEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-700">Delete Account</p>
                    <p className="text-sm text-red-500">Permanently delete your account and data</p>
                  </div>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                    minLength="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                    minLength="6"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-red-700 mb-4">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Two-Factor Authentication Modal */}
        {showTwoFAModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enable Two-Factor Authentication</h3>
              <p className="text-gray-600 mb-6">
                Two-factor authentication adds an extra layer of security to your account. You'll need to enter a verification code from your phone each time you log in.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTwoFAModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTwoFAEnabled(true)
                    setShowTwoFAModal(false)
                    setSuccessMsg('Two-factor authentication enabled!')
                    setTimeout(() => setSuccessMsg(''), 3000)
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
