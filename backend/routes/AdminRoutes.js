const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/AdminController')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

// All routes require authentication and admin role
router.use(authMiddleware)
router.use(adminMiddleware)

// Dashboard stats
router.get('/dashboard', AdminController.getDashboardStats)

// User management
router.get('/users', AdminController.getAllUsers)
router.get('/users/:id', AdminController.getUserById)
router.patch('/users/:id/role', AdminController.updateUserRole)
router.patch('/users/:id/block', AdminController.blockUser)
router.delete('/users/:id', AdminController.deleteUser)

// Produce management
router.get('/produce', AdminController.getAllProduce)
router.delete('/produce/:id', AdminController.deleteProduce)

// Order management
router.get('/orders', AdminController.getAllOrders)

// Buyer verification
router.patch('/buyers/:id/verify', AdminController.verifyBuyer)

module.exports = router
