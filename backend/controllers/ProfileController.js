const User = require('../models/User')
const FarmerProfile = require('../models/FarmerProfile')
const BuyerProfile = require('../models/BuyerProfile')
const Produce = require('../models/Produce')
const Order = require('../models/Order')
const bcrypt = require('bcryptjs')

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
        const { phone, location, farmSize, crops, bankDetails, upiDetails, aadhaarNumber } = req.body

        let profile = await FarmerProfile.findOne({ user: userId })

        if (profile) {
            // Update existing profile
            profile.phone = phone || profile.phone
            profile.location = location || profile.location
            profile.farmSize = farmSize || profile.farmSize
            profile.crops = crops || profile.crops
            profile.bankDetails = bankDetails || profile.bankDetails
            profile.upiDetails = upiDetails || profile.upiDetails
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
                upiDetails,
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
        const { businessName, businessType, phone, location, gstNumber, interestedCommodities, minOrderQuantity, shippingAddresses } = req.body

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
            profile.shippingAddresses = shippingAddresses || profile.shippingAddresses
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
                minOrderQuantity,
                shippingAddresses: shippingAddresses || []
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

// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password and new password are required' 
            })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // Check current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' })
        }

        // Hash new password
        const saltRounds = 12
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

        // Update password
        await User.findByIdAndUpdate(userId, { password: hashedNewPassword })

        res.json({
            success: true,
            message: 'Password changed successfully'
        })
    } catch (error) {
        console.error('Change password error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Enable 2FA
exports.enable2FA = async (req, res) => {
    try {
        const userId = req.userId
        
        await User.findByIdAndUpdate(userId, { twoFAEnabled: true })

        res.json({
            success: true,
            message: 'Two-factor authentication enabled successfully'
        })
    } catch (error) {
        console.error('Enable 2FA error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Disable 2FA
exports.disable2FA = async (req, res) => {
    try {
        const userId = req.userId
        
        await User.findByIdAndUpdate(userId, { twoFAEnabled: false })

        res.json({
            success: true,
            message: 'Two-factor authentication disabled successfully'
        })
    } catch (error) {
        console.error('Disable 2FA error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Delete account
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.userId
        
        // Delete profile based on user role
        const user = await User.findById(userId)
        if (user?.role === 'farmer') {
            await FarmerProfile.findOneAndDelete({ user: userId })
            await Produce.deleteMany({ farmer: userId })
        } else if (user?.role === 'buyer') {
            await BuyerProfile.findOneAndDelete({ user: userId })
        }

        // Delete user's orders
        await Order.deleteMany({ $or: [{ buyer: userId }, { farmer: userId }] })
        
        // Delete user
        await User.findByIdAndDelete(userId)

        res.json({
            success: true,
            message: 'Account deleted successfully'
        })
    } catch (error) {
        console.error('Delete account error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Update notification preferences
exports.updateNotifications = async (req, res) => {
    try {
        const userId = req.userId
        const { notifications } = req.body

        await User.findByIdAndUpdate(userId, { notificationSettings: notifications })

        res.json({
            success: true,
            message: 'Notification preferences updated successfully'
        })
    } catch (error) {
        console.error('Update notifications error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId
        const { currentPassword, newPassword } = req.body

        // Get user with password
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' })
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10)

        // Update password
        await User.findByIdAndUpdate(userId, { password: hashedNewPassword })

        res.json({
            success: true,
            message: 'Password changed successfully'
        })
    } catch (error) {
        console.error('Change password error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Enable 2FA (placeholder implementation)
exports.enable2FA = async (req, res) => {
    try {
        const userId = req.userId

        // In a real implementation, you would generate and return QR code or setup key
        await User.findByIdAndUpdate(userId, { twoFactorEnabled: true })

        res.json({
            success: true,
            message: 'Two-factor authentication enabled successfully'
        })
    } catch (error) {
        console.error('Enable 2FA error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Disable 2FA
exports.disable2FA = async (req, res) => {
    try {
        const userId = req.userId

        await User.findByIdAndUpdate(userId, { twoFactorEnabled: false })

        res.json({
            success: true,
            message: 'Two-factor authentication disabled successfully'
        })
    } catch (error) {
        console.error('Disable 2FA error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Delete account
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.userId

        // Delete associated profiles
        await FarmerProfile.deleteOne({ user: userId })
        await BuyerProfile.deleteOne({ user: userId })
        
        // Delete associated produce and orders
        await Produce.deleteMany({ farmer: userId })
        await Order.deleteMany({ $or: [{ buyer: userId }, { farmer: userId }] })

        // Delete user
        await User.findByIdAndDelete(userId)

        res.json({
            success: true,
            message: 'Account deleted successfully'
        })
    } catch (error) {
        console.error('Delete account error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}
