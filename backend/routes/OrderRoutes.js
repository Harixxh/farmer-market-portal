const express = require('express')
const router = express.Router()
const OrderController = require('../controllers/OrderController')
const authMiddleware = require('../middleware/authMiddleware')

// All routes require authentication
router.use(authMiddleware)

// Create order (buyer places order)
router.post('/', OrderController.createOrder)

// Get buyer's orders
router.get('/buyer', OrderController.getBuyerOrders)

// Get farmer's orders
router.get('/farmer', OrderController.getFarmerOrders)

// Get order by ID
router.get('/:id', OrderController.getOrderById)

// Update order status (farmer accepts/rejects)
router.patch('/:id/status', OrderController.updateOrderStatus)

// Cancel order (buyer cancels)
router.patch('/:id/cancel', OrderController.cancelOrder)

module.exports = router
