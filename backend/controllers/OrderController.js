const Order = require('../models/Order')
const Produce = require('../models/Produce')
const User = require('../models/User')

// Create order (buyer places order)
exports.createOrder = async (req, res) => {
    try {
        const buyerId = req.userId
        const { produceId, quantity, message, deliveryAddress } = req.body

        // Get produce details
        const produce = await Produce.findById(produceId)
        if (!produce) {
            return res.status(404).json({ success: false, message: 'Produce not found' })
        }

        if (produce.status !== 'active') {
            return res.status(400).json({ success: false, message: 'This produce is no longer available' })
        }

        if (quantity > produce.quantity) {
            return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' })
        }

        const totalAmount = quantity * produce.expectedPrice

        const order = new Order({
            produce: produceId,
            farmer: produce.farmer,
            buyer: buyerId,
            quantity,
            unit: produce.unit,
            pricePerUnit: produce.expectedPrice,
            totalAmount,
            message,
            deliveryAddress
        })

        await order.save()

        // Increment inquiries on produce
        produce.inquiries += 1
        await produce.save()

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        })
    } catch (error) {
        console.error('Create order error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get orders for buyer
exports.getBuyerOrders = async (req, res) => {
    try {
        const buyerId = req.userId
        const orders = await Order.find({ buyer: buyerId })
            .populate('produce', 'cropName category')
            .populate('farmer', 'name email')
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            orders
        })
    } catch (error) {
        console.error('Get buyer orders error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get orders for farmer
exports.getFarmerOrders = async (req, res) => {
    try {
        const farmerId = req.userId
        const orders = await Order.find({ farmer: farmerId })
            .populate('produce', 'cropName category')
            .populate('buyer', 'name email')
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            orders
        })
    } catch (error) {
        console.error('Get farmer orders error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Update order status (farmer accepts/rejects)
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id
        const farmerId = req.userId
        const { status } = req.body

        const order = await Order.findOne({ _id: orderId, farmer: farmerId })

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or unauthorized' })
        }

        order.status = status
        order.updatedAt = Date.now()

        // If order is completed, update produce quantity
        if (status === 'completed') {
            const produce = await Produce.findById(order.produce)
            if (produce) {
                produce.quantity -= order.quantity
                if (produce.quantity <= 0) {
                    produce.status = 'sold'
                }
                await produce.save()
            }
        }

        await order.save()

        res.json({
            success: true,
            message: `Order ${status}`,
            order
        })
    } catch (error) {
        console.error('Update order status error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Cancel order (buyer cancels)
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id
        const buyerId = req.userId

        const order = await Order.findOne({ _id: orderId, buyer: buyerId })

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or unauthorized' })
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Cannot cancel this order' })
        }

        order.status = 'cancelled'
        order.updatedAt = Date.now()
        await order.save()

        res.json({
            success: true,
            message: 'Order cancelled',
            order
        })
    } catch (error) {
        console.error('Cancel order error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id
        const userId = req.userId

        const order = await Order.findById(orderId)
            .populate('produce', 'cropName category quantity unit expectedPrice location')
            .populate('farmer', 'name email')
            .populate('buyer', 'name email')

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        // Check if user is farmer or buyer of this order
        if (order.farmer._id.toString() !== userId && order.buyer._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' })
        }

        res.json({
            success: true,
            order
        })
    } catch (error) {
        console.error('Get order by id error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}
