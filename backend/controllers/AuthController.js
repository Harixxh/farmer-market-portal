const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const OTP = require('../models/OTP')
const { sendOTPEmail } = require('../config/emailConfig')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWTSECRECTKEY || 'your-secret-key'

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body

    try {
        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' })
        }

        const hashed = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashed,
            role: role || 'farmer'
        })

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        console.error('Register error:', err)
        res.status(400).json({ success: false, message: err.message })
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User is not registered' })
        }

        // Check if user has a password (might be Google OAuth user)
        if (!user.password) {
            return res.status(400).json({ success: false, message: 'Please login with Google' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password is incorrect' })
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()
        const { email, name, picture, sub: googleId } = payload

        let user = await User.findOne({ email })

        if (!user) {
            user = new User({
                email,
                name,
                googleId,
                profilePicture: picture,
                authProvider: 'google',
                role: 'farmer'
            })
            await user.save()
        } else if (!user.googleId) {
            user.googleId = googleId
            user.authProvider = 'google'
            if (picture) user.profilePicture = picture
            await user.save()
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture
            }
        })
    } catch (error) {
        console.error('Google auth error:', error)
        res.status(401).json({ success: false, message: 'Invalid Google token' })
    }
}

// Forgot Password - Send OTP to email
exports.forgotPassword=async(req,res)=>{
    const {email}=req.body
    
    try{
        // Check if user exists
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({message:'No account found with this email'})
        }
        
        // Check if user registered with Google
        if(user.authProvider==='google' && !user.password){
            return res.status(400).json({message:'This account uses Google sign-in. Please login with Google.'})
        }
        
        // Generate OTP
        const otp=generateOTP()
        
        // Delete any existing OTP for this email
        await OTP.deleteMany({email})
        
        // Save new OTP to database
        await OTP.create({email,otp,type:'password-reset'})
        
        // Send OTP via email
        const sendResult=await sendOTPEmail(email,otp)
        
        if(sendResult.success){
            res.status(200).json({message:'OTP sent to your email'})
        }else{
            await OTP.deleteMany({email})
            res.status(500).json({message:'Failed to send OTP. Please try again.'})
        }
    }catch(err){
        console.error('Forgot password error:',err)
        res.status(500).json({message:'Something went wrong. Please try again.'})
    }
}

// Verify OTP for password reset
exports.verifyResetOTP=async(req,res)=>{
    const {email,otp}=req.body
    
    try{
        const otpRecord=await OTP.findOne({email,otp})
        
        if(!otpRecord){
            return res.status(400).json({message:'Invalid or expired OTP'})
        }
        
        // Mark as verified
        otpRecord.verified=true
        await otpRecord.save()
        
        res.status(200).json({message:'OTP verified successfully',verified:true})
    }catch(err){
        console.error('Verify OTP error:',err)
        res.status(500).json({message:'Error verifying OTP'})
    }
}

// Reset Password
exports.resetPassword=async(req,res)=>{
    const {email,newPassword}=req.body
    
    try{
        // Check if OTP was verified
        const otpRecord=await OTP.findOne({email,verified:true})
        if(!otpRecord){
            return res.status(400).json({message:'Please verify OTP first'})
        }
        
        // Find user
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({message:'User not found'})
        }
        
        // Hash new password
        const hashedPassword=await bcrypt.hash(newPassword,10)
        
        // Update password
        user.password=hashedPassword
        await user.save()
        
        // Delete OTP record
        await OTP.deleteMany({email})
        
        res.status(200).json({message:'Password reset successfully'})
    }catch(err){
        console.error('Reset password error:',err)
        res.status(500).json({message:'Error resetting password'})
    }
}