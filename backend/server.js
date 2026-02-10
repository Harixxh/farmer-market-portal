const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const seedAdmin = require('./config/seedAdmin')

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})