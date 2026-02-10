const mongoose = require('mongoose')

const OTPSchema = mongoose.Schema({
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP expires in 5 minutes
    },
    verified: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('OTP', OTPSchema)
