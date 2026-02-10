import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Market from './pages/Market'
import Weather from './pages/Weather'
import Buyers from './pages/Buyers'
import Profile from './pages/Profile'
import MyProduce from './pages/MyProduce'
import Schemes from './pages/Schemes'
import AdminDashboard from './pages/AdminDashboard'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import NavBar from './components/NavBar'
import FrontPage from './pages/FrontPage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Role-based Route - Farmer Only
const FarmerRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (user) {
    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== 'farmer') {
      return <Navigate to="/dashboard" replace />
    }
  }
  
  return children
}

// Role-based Route - Buyer Only
const BuyerRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (user) {
    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== 'buyer') {
      return <Navigate to="/dashboard" replace />
    }
  }
  
  return children
}

// Admin Protected Route
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (user) {
    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== 'admin') {
      return <Navigate to="/dashboard" replace />
    }
  }
  
  return children
}

// Dashboard Redirect based on role
const DashboardRedirect = () => {
  const user = localStorage.getItem('user')
  
  if (user) {
    const parsedUser = JSON.parse(user)
    if (parsedUser.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else if (parsedUser.role === 'buyer') {
      return <Navigate to="/buyer-dashboard" replace />
    } else {
      return <Navigate to="/farmer-dashboard" replace />
    }
  }
  
  return <Navigate to="/login" replace />
}

// Layout with NavBar
const DashboardLayout = ({ children }) => {
  return (
    <>
      <NavBar />
      {children}
    </>
  )
}

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<FrontPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard redirect based on role */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } />

        {/* Farmer Dashboard */}
        <Route path="/farmer-dashboard" element={
          <FarmerRoute>
            <DashboardLayout><FarmerDashboard /></DashboardLayout>
          </FarmerRoute>
        } />

        {/* Buyer Dashboard */}
        <Route path="/buyer-dashboard" element={
          <BuyerRoute>
            <DashboardLayout><BuyerDashboard /></DashboardLayout>
          </BuyerRoute>
        } />

        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <AdminRoute>
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </AdminRoute>
        } />

        {/* Shared Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <DashboardLayout><Home /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/market" element={
          <ProtectedRoute>
            <DashboardLayout><Market /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/weather" element={
          <ProtectedRoute>
            <DashboardLayout><Weather /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/buyers" element={
          <ProtectedRoute>
            <DashboardLayout><Buyers /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout><Profile /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-produce" element={
          <FarmerRoute>
            <DashboardLayout><MyProduce /></DashboardLayout>
          </FarmerRoute>
        } />
        <Route path="/schemes" element={
          <ProtectedRoute>
            <DashboardLayout><Schemes /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Redirect old routes */}
        <Route path="/about" element={<Navigate to="/dashboard" replace />} />
        <Route path="/service" element={<Navigate to="/market" replace />} />
        <Route path="/contact" element={<Navigate to="/buyers" replace />} />
      </Routes>
    </>
  )
}

export default App