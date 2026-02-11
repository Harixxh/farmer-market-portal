const mongoose = require('mongoose')

const FarmerProfileSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    location: {
        state: { type: String },
        district: { type: String },
        village: { type: String }
    },
    farmSize: {
        value: { type: Number },
        unit: { type: String, default: 'acres' }
    },
    crops: [{
        type: String
    }],
    bankDetails: {
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String },
        accountHolderName: { type: String }
    },
    upiDetails: {
        upiId: { type: String },
        phoneNumber: { type: String }
    },
    aadhaarNumber: {
        type: String
    },
    totalSales: {
        type: Number,
        default: 0
    },
    totalEarnings: {
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

module.exports = mongoose.model('FarmerProfile', FarmerProfileSchema)
