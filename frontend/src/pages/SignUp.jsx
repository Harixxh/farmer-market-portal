import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setupRecaptcha, sendPhoneOTP, verifyPhoneOTP, clearRecaptcha } from '../config/firebase'
import { authAPI, otpAPI } from '../config/api'

const SignUp = () => {
  const [step, setStep] = useState(1) // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'farmer'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // OTP States
  const [otpMethod, setOtpMethod] = useState('email') // 'email' or 'phone'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const otpRefs = useRef([])
  
  const navigate = useNavigate()

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }
    setOtp(newOtp)
  }

  // Send OTP
  const sendOTP = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      if (otpMethod === 'phone') {
        // Use Firebase Phone Auth for SMS OTP
        try {
          await setupRecaptcha('recaptcha-container')
        } catch (recaptchaError) {
          console.log('reCAPTCHA setup issue, retrying...', recaptchaError)
          clearRecaptcha()
          await new Promise(resolve => setTimeout(resolve, 500))
          await setupRecaptcha('recaptcha-container')
        }
        
        const result = await sendPhoneOTP(formData.phone)
        
        if (result.success) {
          setOtpSent(true)
          setResendTimer(60)
          setSuccess('OTP sent to your phone number!')
        } else {
          setError(result.message)
          clearRecaptcha()
        }
      } else {
        // Use backend for Email OTP
        const response = await otpAPI.send({
          email: formData.email,
          type: 'email'
        })
        
        const data = response.data
        
        if (data) {
          setOtpSent(true)
          setResendTimer(60)
          setSuccess(`OTP sent to ${formData.email}`)
        } else {
          setError(data.message || 'Failed to send OTP')
        }
      }
    } catch (err) {
      console.error('OTP Error:', err)
      setError('Unable to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  const verifyOTP = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter complete OTP')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      if (otpMethod === 'phone') {
        // Verify using Firebase Phone Auth
        const result = await verifyPhoneOTP(otpString)
        
        if (result.success) {
          setOtpVerified(true)
          setSuccess('Phone verified successfully!')
          // Proceed to registration
          await registerUser()
        } else {
          setError(result.message)
        }
      } else {
        // Verify using backend for email OTP
        const response = await otpAPI.verify({
          email: formData.email,
          otp: otpString,
          type: 'email'
        })
        
        const data = response.data
        
        if (data.verified) {
          setOtpVerified(true)
          setSuccess('OTP verified successfully!')
          // Proceed to registration
          await registerUser()
        } else {
          setError(data.message || 'Invalid OTP')
        }
      }
    } catch (err) {
      console.error('Verification Error:', err)
      setError('Unable to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Register user after OTP verification
  const registerUser = async () => {
    return registerUserWithData(formData)
  }
  
  // Register user with specific data (for Phone.Email callback)
  const registerUserWithData = async (data) => {
    try {
      const response = await authAPI.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.userType
      })
      
      const responseData = response.data
      
      if (responseData.success) {
        // Save auth data
        localStorage.setItem('token', responseData.token)
        localStorage.setItem('user', JSON.stringify(responseData.user))
        localStorage.setItem('userEmail', responseData.user.email)
        
        setSuccess('Account created successfully! Redirecting...')
        setTimeout(() => {
          if (responseData.user.role === 'admin') {
            navigate('/admin')
          } else {
            navigate('/home')
          }
        }, 1500)
      } else {
        setError(responseData.message || 'Registration failed')
      }
    } catch (err) {
      setError('Unable to connect to server')
    }
  }

  // Handle form submission - move to OTP step
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      return
    }
    
    setStep(2)
  }

  // Go back to form
  const goBack = () => {
    setStep(1)
    setOtpSent(false)
    setOtp(['', '', '', '', '', ''])
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Image Only */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80" 
          alt="Golden wheat field at sunset" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-black">AgriMarket Intelligence</h2>
          </div>
          
          {step === 1 ? (
            <>
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-1 sm:mb-2">Create Account</h1>
                <p className="text-sm sm:text-base text-gray-600">Fill in your details to get started</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none text-black"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none text-black"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none text-black"
                    required
                  />
                </div>

                {/* User Type */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">I am a</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {['farmer', 'buyer'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: type })}
                        className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          formData.userType === type
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-black border border-gray-200 hover:border-green-300'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none text-black pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 text-gray-500 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-500 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none text-black pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5 text-gray-500 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-500 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-1 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all"
                >
                  Continue
                </button>
              </form>

              {/* Sign In Link */}
              <p className="text-center mt-8 text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-black mb-1 sm:mb-2">Verify Your Account</h1>
                <p className="text-sm sm:text-base text-gray-600">Choose your preferred verification method</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">
                  {success}
                </div>
              )}

              {!otpSent ? (
                <>
                  {/* OTP Method Selection */}
                  <div className="space-y-3 sm:space-y-4">
                    <label className="block text-sm font-medium text-black">Send OTP via</label>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setOtpMethod('email')}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          otpMethod === 'email'
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <svg className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 ${otpMethod === 'email' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className={`text-xs sm:text-sm font-medium ${otpMethod === 'email' ? 'text-green-700' : 'text-black'}`}>Email</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{formData.email}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpMethod('phone')}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                          otpMethod === 'phone'
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <svg className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 ${otpMethod === 'phone' ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className={`text-xs sm:text-sm font-medium ${otpMethod === 'phone' ? 'text-green-700' : 'text-black'}`}>Phone</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{formData.phone}</p>
                      </button>
                    </div>
                  </div>

                  {/* Send OTP Button */}
                  <button
                    type="button"
                    onClick={sendOTP}
                    disabled={loading}
                    className="w-full mt-6 py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending OTP...
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </button>

                  {/* reCAPTCHA container for Firebase Phone Auth */}
                  <div id="recaptcha-container"></div>
                </>
              ) : (
                <>
                  {/* OTP Input */}
                  <div className="space-y-4">
                    <p className="text-center text-gray-600">
                      Enter the 6-digit code sent to<br />
                      <span className="font-semibold text-black">
                        {otpMethod === 'email' ? formData.email : formData.phone}
                      </span>
                    </p>
                    
                    {/* OTP Boxes */}
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all text-black"
                        />
                      ))}
                    </div>

                    {/* Resend OTP */}
                    <div className="text-center">
                      {resendTimer > 0 ? (
                        <p className="text-sm text-gray-500">
                          Resend OTP in <span className="font-semibold text-green-600">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={sendOTP}
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="button"
                    onClick={verifyOTP}
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full mt-6 py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </button>
                </>
              )}

              {/* Back Button */}
              <button
                type="button"
                onClick={goBack}
                className="w-full mt-4 py-3 px-4 bg-gray-100 text-black font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                ← Back to Form
              </button>
            </>
          )}

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link to="/" className="text-gray-500 hover:text-black text-sm inline-flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
