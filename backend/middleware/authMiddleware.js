const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWTSECRECTKEY || 'your-secret-key'

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, JWT_SECRET)

        req.userId = decoded.userId
        req.userRole = decoded.role
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
}

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' })
    }
    next()
}

const isFarmer = (req, res, next) => {
    if (req.userRole !== 'farmer') {
        return res.status(403).json({ success: false, message: 'Farmer access required' })
    }
    next()
}

const isBuyer = (req, res, next) => {
    if (req.userRole !== 'buyer') {
        return res.status(403).json({ success: false, message: 'Buyer access required' })
    }
    next()
}

// Export both as default (for backward compatibility) and named exports
module.exports = verifyToken
module.exports.verifyToken = verifyToken
module.exports.isAdmin = isAdmin
module.exports.isFarmer = isFarmer
module.exports.isBuyer = isBuyer
