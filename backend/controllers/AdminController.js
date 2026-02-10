const User = require('../models/User')
const FarmerProfile = require('../models/FarmerProfile')
const BuyerProfile = require('../models/BuyerProfile')
const Produce = require('../models/Produce')
const Order = require('../models/Order')

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        const totalFarmers = await User.countDocuments({ role: 'farmer' })
        const totalBuyers = await User.countDocuments({ role: 'buyer' })
        const totalAdmins = await User.countDocuments({ role: 'admin' })

        const totalProduce = await Produce.countDocuments()
        const activeProduce = await Produce.countDocuments({ status: 'active' })
        const soldProduce = await Produce.countDocuments({ status: 'sold' })

        const totalOrders = await Order.countDocuments()
        const pendingOrders = await Order.countDocuments({ status: 'pending' })
        const completedOrders = await Order.countDocuments({ status: 'completed' })

        const completedOrdersData = await Order.find({ status: 'completed' })
        const totalRevenue = completedOrdersData.reduce((sum, order) => sum + order.totalAmount, 0)

        // Recent activity
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt')
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5)
            .populate('farmer', 'name')
            .populate('buyer', 'name')
            .populate('produce', 'cropName')

        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    farmers: totalFarmers,
                    buyers: totalBuyers,
                    admins: totalAdmins
                },
                produce: {
                    total: totalProduce,
                    active: activeProduce,
                    sold: soldProduce
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    completed: completedOrders,
                    revenue: totalRevenue
                }
            },
            recentUsers,
            recentOrders
        })
    } catch (error) {
        console.error('Get dashboard stats error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query
        const query = {}

        if (role && role !== 'all') {
            query.role = role
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await User.countDocuments(query)

        res.json({
            success: true,
            users,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: total
            }
        })
    } catch (error) {
        console.error('Get all users error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get user by ID with profile
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id
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

        // Get user activity
        let activity = {}
        if (user.role === 'farmer') {
            activity.produce = await Produce.countDocuments({ farmer: userId })
            activity.orders = await Order.countDocuments({ farmer: userId })
        } else if (user.role === 'buyer') {
            activity.orders = await Order.countDocuments({ buyer: userId })
        }

        res.json({
            success: true,
            user,
            profile,
            activity
        })
    } catch (error) {
        console.error('Get user by id error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id
        const { role } = req.body

        if (!['farmer', 'buyer', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' })
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password')

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        res.json({
            success: true,
            message: 'User role updated',
            user
        })
    } catch (error) {
        console.error('Update user role error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Block/Unblock user
exports.blockUser = async (req, res) => {
    try {
        const userId = req.params.id
        const { blocked } = req.body

        const user = await User.findByIdAndUpdate(
            userId,
            { blocked: blocked },
            { new: true }
        ).select('-password')

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        res.json({
            success: true,
            message: blocked ? 'User blocked' : 'User unblocked',
            user
        })
    } catch (error) {
        console.error('Block user error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // Delete associated data
        if (user.role === 'farmer') {
            await FarmerProfile.deleteOne({ user: userId })
            await Produce.deleteMany({ farmer: userId })
            await Order.deleteMany({ farmer: userId })
        } else if (user.role === 'buyer') {
            await BuyerProfile.deleteOne({ user: userId })
            await Order.deleteMany({ buyer: userId })
        }

        await User.findByIdAndDelete(userId)

        res.json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (error) {
        console.error('Delete user error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get all produce (admin view)
exports.getAllProduce = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query
        const query = {}

        if (status && status !== 'all') {
            query.status = status
        }

        if (search) {
            query.$or = [
                { cropName: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ]
        }

        const produce = await Produce.find(query)
            .populate('farmer', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await Produce.countDocuments(query)

        res.json({
            success: true,
            produce,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: total
            }
        })
    } catch (error) {
        console.error('Get all produce error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get all orders (admin view)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query
        const query = {}

        if (status && status !== 'all') {
            query.status = status
        }

        const orders = await Order.find(query)
            .populate('farmer', 'name email')
            .populate('buyer', 'name email')
            .populate('produce', 'cropName category')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await Order.countDocuments(query)

        res.json({
            success: true,
            orders,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: total
            }
        })
    } catch (error) {
        console.error('Get all orders error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Delete produce (admin)
exports.deleteProduce = async (req, res) => {
    try {
        const produceId = req.params.id

        const produce = await Produce.findById(produceId)
        if (!produce) {
            return res.status(404).json({ success: false, message: 'Produce not found' })
        }

        // Delete associated orders
        await Order.deleteMany({ produce: produceId })
        await Produce.findByIdAndDelete(produceId)

        res.json({
            success: true,
            message: 'Produce deleted successfully'
        })
    } catch (error) {
        console.error('Delete produce error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Verify buyer
exports.verifyBuyer = async (req, res) => {
    try {
        const userId = req.params.id

        const profile = await BuyerProfile.findOne({ user: userId })
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Buyer profile not found' })
        }

        profile.verified = true
        profile.updatedAt = Date.now()
        await profile.save()

        res.json({
            success: true,
            message: 'Buyer verified successfully',
            profile
        })
    } catch (error) {
        console.error('Verify buyer error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}
