const express = require('express')
const router = express.Router()
const PaymentController = require('../controllers/PaymentController')
const authMiddleware = require('../middleware/authMiddleware')

// All routes require authentication
router.use(authMiddleware)

// Create Razorpay order
router.post('/create-order', PaymentController.createPaymentOrder)

// Verify payment
router.post('/verify', PaymentController.verifyPayment)

// Select COD
router.post('/cod', PaymentController.selectCOD)

// Get payment details for an order
router.get('/:orderId', PaymentController.getPaymentDetails)

module.exports = router
