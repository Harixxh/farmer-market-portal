const mongoose = require('mongoose')

const TrackingEventSchema = mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
}, { _id: false })

const OrderSchema = mongoose.Schema({
    produce: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produce',
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'quintal'
    },
    pricePerUnit: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'cancelled']
    },
    // Payment fields
    paymentStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'paid', 'failed', 'refunded']
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cod', 'upi', 'bank_transfer', null],
        default: null
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    paidAt: {
        type: Date
    },
    // Tracking fields
    tracking: [TrackingEventSchema],
    estimatedDelivery: {
        type: Date
    },
    // Farmer payout tracking
    farmerPaidOut: {
        type: Boolean,
        default: false
    },
    farmerPaidOutAt: {
        type: Date
    },
    farmerPaidOutBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    message: {
        type: String
    },
    // Detailed shipping address
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        landmark: { type: String },
        addressType: { type: String, enum: ['home', 'office', 'warehouse'], default: 'office' }
    },
    // Advanced tracking (like Amazon)
    trackingNumber: {
        type: String
    },
    carrierName: {
        type: String // 'Blue Dart', 'DTDC', 'India Post', etc.
    },
    carrierTrackingUrl: {
        type: String
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Order', OrderSchema)
