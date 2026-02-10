const express = require('express')
const router = express.Router()
const ProduceController = require('../controllers/ProduceController')
const authMiddleware = require('../middleware/authMiddleware')

// All routes require authentication
router.use(authMiddleware)

// Create produce (farmer only)
router.post('/', ProduceController.createProduce)

// Get farmer's own produce
router.get('/my', ProduceController.getMyProduce)

// Get farmer's produce stats
router.get('/stats', ProduceController.getProduceStats)

// Get all active produce (marketplace)
router.get('/marketplace', ProduceController.getAllProduce)

// Get produce by ID
router.get('/:id', ProduceController.getProduceById)

// Update produce
router.put('/:id', ProduceController.updateProduce)

// Mark as sold
router.patch('/:id/sold', ProduceController.markAsSold)

// Delete produce
router.delete('/:id', ProduceController.deleteProduce)

module.exports = router
