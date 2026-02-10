const Produce = require('../models/Produce')
const User = require('../models/User')
const mongoose = require('mongoose')

// Create new produce listing
exports.createProduce = async (req, res) => {
    try {
        const { cropName, category, quantity, unit, expectedPrice, quality, harvestDate, availableUntil, location, description, image } = req.body
        const farmerId = req.userId // From auth middleware

        // Handle location - convert object to string if needed
        let locationString = location
        if (typeof location === 'object' && location !== null) {
            const parts = []
            if (location.district) parts.push(location.district)
            if (location.state) parts.push(location.state)
            locationString = parts.join(', ') || 'India'
        }

        const produce = new Produce({
            farmer: farmerId,
            cropName,
            category,
            quantity,
            unit,
            expectedPrice,
            quality,
            harvestDate,
            availableUntil,
            location: locationString,
            description,
            image: image || ''
        })

        await produce.save()

        res.status(201).json({
            success: true,
            message: 'Produce listed successfully',
            produce
        })
    } catch (error) {
        console.error('Create produce error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get all produce for a farmer
exports.getMyProduce = async (req, res) => {
    try {
        const farmerId = req.userId
        const produce = await Produce.find({ farmer: farmerId }).sort({ createdAt: -1 })

        res.json({
            success: true,
            produce
        })
    } catch (error) {
        console.error('Get my produce error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get all active produce (for buyers to browse)
exports.getAllProduce = async (req, res) => {
    try {
        const { category, location, minPrice, maxPrice, search } = req.query
        
        let query = { status: 'active' }
        
        if (category && category !== 'all') {
            query.category = category
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' }
        }
        if (minPrice || maxPrice) {
            query.expectedPrice = {}
            if (minPrice) query.expectedPrice.$gte = Number(minPrice)
            if (maxPrice) query.expectedPrice.$lte = Number(maxPrice)
        }
        if (search) {
            query.$or = [
                { cropName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        const produce = await Produce.find(query)
            .populate('farmer', 'name email')
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            produce
        })
    } catch (error) {
        console.error('Get all produce error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get single produce by ID
exports.getProduceById = async (req, res) => {
    try {
        const produce = await Produce.findById(req.params.id)
            .populate('farmer', 'name email')

        if (!produce) {
            return res.status(404).json({ success: false, message: 'Produce not found' })
        }

        // Increment views
        produce.views += 1
        await produce.save()

        res.json({
            success: true,
            produce
        })
    } catch (error) {
        console.error('Get produce by id error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Update produce
exports.updateProduce = async (req, res) => {
    try {
        const produceId = req.params.id
        const farmerId = req.userId
        const updates = req.body

        const produce = await Produce.findOne({ _id: produceId, farmer: farmerId })

        if (!produce) {
            return res.status(404).json({ success: false, message: 'Produce not found or unauthorized' })
        }

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                produce[key] = updates[key]
            }
        })
        produce.updatedAt = Date.now()

        await produce.save()

        res.json({
            success: true,
            message: 'Produce updated successfully',
            produce
        })
    } catch (error) {
        console.error('Update produce error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Mark produce as sold
exports.markAsSold = async (req, res) => {
    try {
        const produceId = req.params.id
        const farmerId = req.userId

        const produce = await Produce.findOneAndUpdate(
            { _id: produceId, farmer: farmerId },
            { status: 'sold', updatedAt: Date.now() },
            { new: true }
        )

        if (!produce) {
            return res.status(404).json({ success: false, message: 'Produce not found or unauthorized' })
        }

        res.json({
            success: true,
            message: 'Produce marked as sold',
            produce
        })
    } catch (error) {
        console.error('Mark as sold error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Delete produce
exports.deleteProduce = async (req, res) => {
    try {
        const produceId = req.params.id
        const farmerId = req.userId

        const produce = await Produce.findOneAndDelete({ _id: produceId, farmer: farmerId })

        if (!produce) {
            return res.status(404).json({ success: false, message: 'Produce not found or unauthorized' })
        }

        res.json({
            success: true,
            message: 'Produce deleted successfully'
        })
    } catch (error) {
        console.error('Delete produce error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}

// Get produce stats for farmer dashboard
exports.getProduceStats = async (req, res) => {
    try {
        const farmerId = req.userId

        const totalListings = await Produce.countDocuments({ farmer: farmerId })
        const activeListings = await Produce.countDocuments({ farmer: farmerId, status: 'active' })
        const soldListings = await Produce.countDocuments({ farmer: farmerId, status: 'sold' })
        
        const viewsAndInquiries = await Produce.aggregate([
            { $match: { farmer: new mongoose.Types.ObjectId(farmerId) } },
            { $group: { _id: null, totalViews: { $sum: '$views' }, totalInquiries: { $sum: '$inquiries' } } }
        ])

        res.json({
            success: true,
            stats: {
                totalListings,
                activeListings,
                soldListings,
                totalViews: viewsAndInquiries[0]?.totalViews || 0,
                totalInquiries: viewsAndInquiries[0]?.totalInquiries || 0
            }
        })
    } catch (error) {
        console.error('Get produce stats error:', error)
        res.status(500).json({ success: false, message: 'Server error', error: error.message })
    }
}
