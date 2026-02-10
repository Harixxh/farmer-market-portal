const mongoose = require('mongoose')

const ProduceSchema = mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    cropName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['grains', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'spices']
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'quintal',
        enum: ['quintal', 'kg', 'ton']
    },
    expectedPrice: {
        type: Number,
        required: true
    },
    quality: {
        type: String,
        default: 'A',
        enum: ['A', 'B', 'C']
    },
    harvestDate: {
        type: Date
    },
    availableUntil: {
        type: Date
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'sold', 'expired']
    },
    views: {
        type: Number,
        default: 0
    },
    inquiries: {
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

module.exports = mongoose.model('Produce', ProduceSchema)
