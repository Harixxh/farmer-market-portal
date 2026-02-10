const User = require('../models/User')

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' })
        }

        next()
    } catch (error) {
        console.error('Admin middleware error:', error)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}

module.exports = adminMiddleware
