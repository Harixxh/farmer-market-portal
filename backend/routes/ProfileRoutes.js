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

// Security routes
router.put('/change-password', ProfileController.changePassword)
router.put('/enable-2fa', ProfileController.enable2FA)
router.put('/disable-2fa', ProfileController.disable2FA)
router.delete('/delete-account', ProfileController.deleteAccount)
router.put('/notifications', ProfileController.updateNotifications)

module.exports = router
