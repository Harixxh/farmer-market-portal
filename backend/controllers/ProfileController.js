const User = require('../models/User')
const FarmerProfile = require('../models/FarmerProfile')
const BuyerProfile = require('../models/BuyerProfile')
const Produce = require('../models/Produce')
const Order = require('../models/Order')

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select('-password')

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        let profile = null

        if (user.role === 'farmer') {
            profile = await FarmerProfile.findOne({ user: userId })
        } else if (user.role === 'buyer') {
            profile = await BuyerProfile.findOne({ user: userId })
        }

        res.json({
            success: true,
            user,
            profile
        })
    } catch (error) {
        console.error('Get profile error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Update user basic info
exports.updateBasicInfo = async (req, res) => {
    try {
        const userId = req.userId
        const { name, email } = req.body

        const user = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true }
        ).select('-password')

        res.json({
            success: true,
            message: 'Basic info updated',
            user
        })
    } catch (error) {
        console.error('Update basic info error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Create/Update farmer profile
exports.updateFarmerProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { phone, location, farmSize, crops, bankDetails, aadhaarNumber } = req.body

        let profile = await FarmerProfile.findOne({ user: userId })

        if (profile) {
            // Update existing profile
            profile.phone = phone || profile.phone
            profile.location = location || profile.location
            profile.farmSize = farmSize || profile.farmSize
            profile.crops = crops || profile.crops
            profile.bankDetails = bankDetails || profile.bankDetails
            profile.aadhaarNumber = aadhaarNumber || profile.aadhaarNumber
            profile.updatedAt = Date.now()

            await profile.save()
        } else {
            // Create new profile
            profile = new FarmerProfile({
                user: userId,
                phone,
                location,
                farmSize,
                crops,
                bankDetails,
                aadhaarNumber
            })
            await profile.save()
        }

        res.json({
            success: true,
            message: 'Farmer profile updated',
            profile
        })
    } catch (error) {
        console.error('Update farmer profile error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Create/Update buyer profile
exports.updateBuyerProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { businessName, businessType, phone, location, gstNumber, interestedCommodities, minOrderQuantity } = req.body

        let profile = await BuyerProfile.findOne({ user: userId })

        if (profile) {
            // Update existing profile
            profile.businessName = businessName || profile.businessName
            profile.businessType = businessType || profile.businessType
            profile.phone = phone || profile.phone
            profile.location = location || profile.location
            profile.gstNumber = gstNumber || profile.gstNumber
            profile.interestedCommodities = interestedCommodities || profile.interestedCommodities
            profile.minOrderQuantity = minOrderQuantity || profile.minOrderQuantity
            profile.updatedAt = Date.now()

            await profile.save()
        } else {
            // Create new profile
            profile = new BuyerProfile({
                user: userId,
                businessName,
                businessType,
                phone,
                location,
                gstNumber,
                interestedCommodities,
                minOrderQuantity
            })
            await profile.save()
        }

        res.json({
            success: true,
            message: 'Buyer profile updated',
            profile
        })
    } catch (error) {
        console.error('Update buyer profile error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get farmer dashboard stats
exports.getFarmerStats = async (req, res) => {
    try {
        const userId = req.userId

        const totalProduce = await Produce.countDocuments({ farmer: userId })
        const activeProduce = await Produce.countDocuments({ farmer: userId, status: 'active' })
        const soldProduce = await Produce.countDocuments({ farmer: userId, status: 'sold' })

        const orders = await Order.find({ farmer: userId, status: 'completed' })
        const totalEarnings = orders.reduce((sum, order) => sum + order.totalAmount, 0)

        const pendingOrders = await Order.countDocuments({ farmer: userId, status: 'pending' })

        res.json({
            success: true,
            stats: {
                totalProduce,
                activeProduce,
                soldProduce,
                totalEarnings,
                pendingOrders,
                totalOrders: orders.length
            }
        })
    } catch (error) {
        console.error('Get farmer stats error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get buyer dashboard stats
exports.getBuyerStats = async (req, res) => {
    try {
        const userId = req.userId

        const totalOrders = await Order.countDocuments({ buyer: userId })
        const pendingOrders = await Order.countDocuments({ buyer: userId, status: 'pending' })
        const completedOrders = await Order.countDocuments({ buyer: userId, status: 'completed' })

        const orders = await Order.find({ buyer: userId, status: 'completed' })
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0)

        res.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalSpent
            }
        })
    } catch (error) {
        console.error('Get buyer stats error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get all buyers (for farmers to see)
exports.getAllBuyers = async (req, res) => {
    try {
        const buyers = await User.find({ role: 'buyer' }).select('name email createdAt')
        const buyerProfiles = await BuyerProfile.find().populate('user', 'name email')

        // Merge buyer data with profiles
        const buyerData = buyers.map(buyer => {
            const profile = buyerProfiles.find(p => p.user._id.toString() === buyer._id.toString())
            return {
                _id: buyer._id,
                name: buyer.name,
                email: buyer.email,
                createdAt: buyer.createdAt,
                profile: profile || null
            }
        })

        res.json({
            success: true,
            buyers: buyerData
        })
    } catch (error) {
        console.error('Get all buyers error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get all farmers (for buyers to see)
exports.getAllFarmers = async (req, res) => {
    try {
        const farmers = await User.find({ role: 'farmer' }).select('name email createdAt')
        const farmerProfiles = await FarmerProfile.find().populate('user', 'name email')

        // Merge farmer data with profiles
        const farmerData = farmers.map(farmer => {
            const profile = farmerProfiles.find(p => p.user._id.toString() === farmer._id.toString())
            return {
                _id: farmer._id,
                name: farmer.name,
                email: farmer.email,
                createdAt: farmer.createdAt,
                profile: profile || null
            }
        })

        res.json({
            success: true,
            farmers: farmerData
        })
    } catch (error) {
        console.error('Get all farmers error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}
