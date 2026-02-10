const express = require('express')
const router = express.Router()
const ProfileController = require('../controllers/ProfileController')
const authMiddleware = require('../middleware/authMiddleware')

// All routes require authentication
router.use(authMiddleware)

// Get current user profile
router.get('/me', ProfileController.getProfile)

// Update basic info
router.put('/basic', ProfileController.updateBasicInfo)

// Update farmer profile
router.put('/farmer', ProfileController.updateFarmerProfile)

// Update buyer profile
router.put('/buyer', ProfileController.updateBuyerProfile)

// Get farmer stats
router.get('/farmer/stats', ProfileController.getFarmerStats)

// Get buyer stats
router.get('/buyer/stats', ProfileController.getBuyerStats)

// Get all buyers (public for farmers)
router.get('/buyers', ProfileController.getAllBuyers)

// Get all farmers (public for buyers)
router.get('/farmers', ProfileController.getAllFarmers)

module.exports = router
