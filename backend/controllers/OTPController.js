const OTP = require('../models/OTP')
const User = require('../models/User')
const { sendOTPEmail } = require('../config/emailConfig')

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP (for email only - phone uses Firebase on frontend)
exports.sendOTP = async (req, res) => {
    const { email, type } = req.body
    
    try {
        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' })
        }
        
        // Generate OTP
        const otp = generateOTP()
        
        // Delete any existing OTP for this email
        await OTP.deleteMany({ email })
        
        // Save new OTP to database
        await OTP.create({ email, otp })
        
        // Send OTP via email
        const sendResult = await sendOTPEmail(email, otp)
        
        if (sendResult.success) {
            res.status(200).json({ 
                message: `OTP sent successfully to ${email}`
            })
        } else {
            await OTP.deleteMany({ email })
            res.status(500).json({ 
                message: `Failed to send OTP: ${sendResult.error}` 
            })
        }
        
    } catch (err) {
        console.error('Error in sendOTP:', err)
        res.status(500).json({ message: 'Error sending OTP' })
    }
}

// Verify OTP (for email only - phone uses Firebase on frontend)
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body
    
    try {
        // Find OTP record
        const otpRecord = await OTP.findOne({ email, otp })
        
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' })
        }
        
        // Mark as verified
        otpRecord.verified = true
        await otpRecord.save()
        
        res.status(200).json({ 
            message: 'OTP verified successfully',
            verified: true
        })
        
    } catch (err) {
        console.error('Error verifying OTP:', err)
        res.status(500).json({ message: 'Error verifying OTP' })
    }
}

// Check if OTP is verified (used during registration)
exports.checkOTPVerified = async (email) => {
    try {
        const otpRecord = await OTP.findOne({ email, verified: true })
        return !!otpRecord
    } catch (err) {
        return false
    }
}
