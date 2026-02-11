const mongoose = require('mongoose')

const BuyerProfileSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        enum: ['wholesaler', 'retailer', 'exporter', 'processor'],
        required: true
    },
    phone: {
        type: String
    },
    location: {
        state: { type: String },
        city: { type: String },
        address: { type: String }
    },
    shippingAddresses: [{
        name: { type: String },
        phone: { type: String },
        addressLine1: { type: String },
        addressLine2: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        landmark: { type: String },
        addressType: { type: String, enum: ['home', 'office', 'warehouse'], default: 'office' },
        isDefault: { type: Boolean, default: false }
    }],
    gstNumber: {
        type: String
    },
    interestedCommodities: [{
        type: String
    }],
    minOrderQuantity: {
        type: Number,
        default: 1
    },
    description: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    totalPurchases: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
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

module.exports = mongoose.model('BuyerProfile', BuyerProfileSchema)
