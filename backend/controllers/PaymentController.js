const Razorpay = require('razorpay')
const crypto = require('crypto')
const Order = require('../models/Order')

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Create Razorpay order for an existing order
exports.createPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.body
        const userId = req.userId

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        // Only buyer can pay
        if (order.buyer.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' })
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Order already paid' })
        }

        if (order.status === 'cancelled' || order.status === 'rejected') {
            return res.status(400).json({ success: false, message: 'Cannot pay for cancelled/rejected order' })
        }

        // Create Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: 'INR',
            receipt: `order_${orderId}`,
            notes: {
                orderId: orderId,
                buyerId: userId,
                farmerId: order.farmer.toString()
            }
        })

        // Save razorpay order id
        order.razorpayOrderId = razorpayOrder.id
        order.updatedAt = Date.now()
        await order.save()

        res.json({
            success: true,
            razorpayOrder: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            },
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        console.error('Create payment order error:', error)
        res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message })
    }
}

// Verify payment after Razorpay checkout
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex')

        const isAuthentic = expectedSignature === razorpay_signature

        if (!isAuthentic) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' })
        }

        // Update order with payment details
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        order.razorpayPaymentId = razorpay_payment_id
        order.razorpaySignature = razorpay_signature
        order.paymentStatus = 'paid'
        order.paymentMethod = 'razorpay'
        order.paidAt = new Date()
        order.updatedAt = Date.now()

        // Add tracking event
        order.tracking.push({
            status: 'payment_received',
            description: `Payment of ₹${order.totalAmount} received via Razorpay`,
            timestamp: new Date()
        })

        await order.save()

        res.json({
            success: true,
            message: 'Payment verified successfully',
            order: {
                _id: order._id,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                razorpayPaymentId: order.razorpayPaymentId,
                paidAt: order.paidAt
            }
        })
    } catch (error) {
        console.error('Verify payment error:', error)
        res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message })
    }
}

// Get payment details for an order
exports.getPaymentDetails = async (req, res) => {
    try {
        const { orderId } = req.params
        const userId = req.userId

        const order = await Order.findById(orderId)
            .populate('produce', 'cropName category')
            .populate('farmer', 'name email')
            .populate('buyer', 'name email')

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        // Only buyer or farmer can view payment details
        if (order.farmer._id.toString() !== userId && order.buyer._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' })
        }

        // Get Razorpay payment details if paid
        let razorpayDetails = null
        if (order.razorpayPaymentId) {
            try {
                razorpayDetails = await razorpay.payments.fetch(order.razorpayPaymentId)
            } catch (e) {
                console.log('Could not fetch Razorpay details:', e.message)
            }
        }

        res.json({
            success: true,
            payment: {
                orderId: order._id,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                razorpayOrderId: order.razorpayOrderId,
                razorpayPaymentId: order.razorpayPaymentId,
                paidAt: order.paidAt,
                produce: order.produce,
                farmer: order.farmer,
                buyer: order.buyer,
                razorpayDetails: razorpayDetails ? {
                    method: razorpayDetails.method,
                    bank: razorpayDetails.bank,
                    wallet: razorpayDetails.wallet,
                    vpa: razorpayDetails.vpa,
                    email: razorpayDetails.email,
                    contact: razorpayDetails.contact
                } : null
            }
        })
    } catch (error) {
        console.error('Get payment details error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Handle COD payment selection
exports.selectCOD = async (req, res) => {
    try {
        const { orderId } = req.body
        const userId = req.userId

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        if (order.buyer.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' })
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Order already paid' })
        }

        order.paymentMethod = 'cod'
        order.paymentStatus = 'pending'
        order.updatedAt = Date.now()
        order.tracking.push({
            status: 'cod_selected',
            description: 'Cash on Delivery selected as payment method',
            timestamp: new Date()
        })

        await order.save()

        res.json({
            success: true,
            message: 'Cash on Delivery selected',
            order: {
                _id: order._id,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus
            }
        })
    } catch (error) {
        console.error('Select COD error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}
