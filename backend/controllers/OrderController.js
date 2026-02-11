const Order = require('../models/Order')
const Produce = require('../models/Produce')
const User = require('../models/User')
const mongoose = require('mongoose')

// Create order (buyer places order)
exports.createOrder = async (req, res) => {
    try {
        const buyerId = req.userId
        const { produceId, quantity, message, shippingAddress } = req.body

        // Validate shipping address
        if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
            return res.status(400).json({ success: false, message: 'Complete shipping address is required' })
        }

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
            shippingAddress,
            tracking: [{
                status: 'order_placed',
                description: 'Order has been placed by buyer',
                timestamp: new Date()
            }]
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
            .populate('produce', 'cropName category image')
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
            .populate('produce', 'cropName category image')
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

// Update order status (farmer updates)
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id
        const farmerId = req.userId
        const { status } = req.body

        const order = await Order.findOne({ _id: orderId, farmer: farmerId })

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or unauthorized' })
        }

        // Initialize tracking array if it doesn't exist
        if (!order.tracking) {
            order.tracking = []
        }

        const statusDescriptions = {
            accepted: 'Order accepted by farmer',
            rejected: 'Order rejected by farmer',
            packed: 'Order has been packed and is ready for pickup/shipping',
            shipped: 'Order has been shipped',
            out_for_delivery: 'Order is out for delivery',
            delivered: 'Order has been delivered',
            completed: 'Order completed successfully'
        }

        order.status = status
        order.updatedAt = Date.now()

        // Add tracking event
        try {
            order.tracking.push({
                status: status,
                description: statusDescriptions[status] || `Order status updated to ${status}`,
                timestamp: new Date(),
                updatedBy: new mongoose.Types.ObjectId(farmerId)
            })
        } catch (trackingError) {
            console.error('Tracking error:', trackingError)
            // Continue without tracking if it fails
        }

        // Set estimated delivery when accepted
        if (status === 'accepted') {
            const estimatedDate = new Date()
            estimatedDate.setDate(estimatedDate.getDate() + 5)
            order.estimatedDelivery = estimatedDate
        }

        // If delivered and COD, mark payment as pending collection
        if (status === 'delivered' && order.paymentMethod === 'cod') {
            order.paymentStatus = 'paid'
            order.paidAt = new Date()
            try {
                order.tracking.push({
                    status: 'cod_payment_collected',
                    description: 'Cash on Delivery payment collected',
                    timestamp: new Date(),
                    updatedBy: new mongoose.Types.ObjectId(farmerId)
                })
            } catch (trackingError) {
                console.error('COD tracking error:', trackingError)
                // Continue without tracking if it fails
            }
        }

        // If order is completed, update produce quantity
        if (status === 'completed' || status === 'delivered') {
            try {
                const produce = await Produce.findById(order.produce)
                if (produce && produce.quantity > 0) {
                    produce.quantity -= order.quantity
                    if (produce.quantity <= 0) {
                        produce.status = 'sold'
                    }
                    await produce.save()
                }
            } catch (produceError) {
                console.error('Produce update error:', produceError)
                // Continue without updating produce if it fails
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

        if (!['pending', 'accepted'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Cannot cancel this order at current stage' })
        }

        order.status = 'cancelled'
        order.updatedAt = Date.now()
        order.tracking.push({
            status: 'cancelled',
            description: 'Order cancelled by buyer',
            timestamp: new Date()
        })

        // If already paid, mark for refund
        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded'
            order.tracking.push({
                status: 'refund_initiated',
                description: 'Refund initiated for cancelled order',
                timestamp: new Date()
            })
        }

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

// Get order by ID (with full tracking)
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id
        const userId = req.userId

        const order = await Order.findById(orderId)
            .populate('produce', 'cropName category quantity unit expectedPrice location image')
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
// Update tracking details (farmer adds carrier info)
exports.updateTrackingDetails = async (req, res) => {
    try {
        const orderId = req.params.id
        const farmerId = req.userId
        const { trackingNumber, carrierName, shippingCost, location } = req.body

        const order = await Order.findOne({ _id: orderId, farmer: farmerId })

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or unauthorized' })
        }

        // Update tracking details
        if (trackingNumber) order.trackingNumber = trackingNumber
        if (carrierName) order.carrierName = carrierName
        if (shippingCost !== undefined) order.shippingCost = shippingCost
        
        // Generate carrier tracking URL based on carrier
        if (trackingNumber && carrierName) {
            const trackingUrls = {
                'Blue Dart': `https://www.bluedart.com/tracking/shipment.jsp?airwaybillno=${trackingNumber}`,
                'DTDC': `https://www.dtdc.in/tracking/shipment.jsp?id=${trackingNumber}`,
                'India Post': `https://www.indiapost.gov.in/VAS/Pages/IndiaPostHome.aspx#trackingid=${trackingNumber}`,
                'Delhivery': `https://www.delhivery.com/track/package/${trackingNumber}`,
                'Ecom Express': `https://ecomexpress.in/track/shipment.jsp?id=${trackingNumber}`
            }
            order.carrierTrackingUrl = trackingUrls[carrierName] || ''
        }

        // Add tracking event
        try {
            order.tracking.push({
                status: 'tracking_updated',
                description: `Tracking details updated: ${carrierName} - ${trackingNumber}`,
                location: location || '',
                timestamp: new Date(),
                updatedBy: new mongoose.Types.ObjectId(farmerId)
            })
        } catch (trackingError) {
            console.error('Tracking event error:', trackingError)
        }

        order.updatedAt = Date.now()
        await order.save()

        res.json({
            success: true,
            message: 'Tracking details updated successfully',
            order
        })
    } catch (error) {
        console.error('Update tracking details error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}