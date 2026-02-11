const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const seedAdmin = require('./config/seedAdmin')

dotenv.config()

const app = express()

// Security & Production Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://farmer-market-portal.onrender.com',
        'https://farmer-market-portal.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.removeHeader('X-Powered-By')
    next()
})

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Database connection
mongoose.connect(process.env.dbpassword).then(async () => {
    console.log('MongoDB connected successfully')
    // Seed admin user on startup
    await seedAdmin()
}).catch((err) => {
    console.log('Error connecting MongoDB:', err.message)
})

// Routes
app.use('/auth', require('./routes/AuthRoutes'))
app.use('/otp', require('./routes/OTPRoutes'))
app.use('/api/produce', require('./routes/ProduceRoutes'))
app.use('/api/orders', require('./routes/OrderRoutes'))
app.use('/api/profile', require('./routes/ProfileRoutes'))
app.use('/api/admin', require('./routes/AdminRoutes'))
app.use('/api/schemes', require('./routes/SchemeRoutes'))
app.use('/api/market', require('./routes/MarketRoutes'))
app.use('/api/upload', require('./routes/UploadRoutes'))
app.use('/api/payments', require('./routes/PaymentRoutes'))

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack || err.message)
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})