import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/auth/forgot-password', { email })
      setSuccess(response.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/auth/verify-reset-otp', { email, otp })
      setSuccess(response.data.message)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/auth/reset-password', { email, newPassword })
      setSuccess(response.data.message)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/auth/forgot-password', { email })
      setSuccess('OTP resent successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80"
          alt="Agricultural field"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="AgriMarket Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-green-700">AgriMarket</span>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Forgot Password?</h1>
              <p className="text-gray-500 mb-8">Enter your email to receive a verification code</p>

              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Verify OTP</h1>
              <p className="text-gray-500 mb-8">Enter the 6-digit code sent to {email}</p>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-green-600 hover:text-green-600 transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Create New Password</h1>
              <p className="text-gray-500 mb-8">Enter your new password below</p>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
