const mongoose = require('mongoose')

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
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled']
    },
    paymentStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'paid', 'refunded']
    },
    message: {
        type: String
    },
    deliveryAddress: {
        type: String
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
