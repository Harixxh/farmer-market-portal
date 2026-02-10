const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get all schemes (public)
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json({ success: true, schemes });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single scheme
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    res.json({ success: true, scheme });
  } catch (error) {
    console.error('Error fetching scheme:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create scheme (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, type, ministry, eligibility, deadline, link, status } = req.body;
    
    const scheme = new Scheme({
      name,
      description,
      type,
      ministry,
      eligibility,
      deadline,
      link,
      status
    });
    
    await scheme.save();
    res.status(201).json({ success: true, scheme });
  } catch (error) {
    console.error('Error creating scheme:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update scheme (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    
    res.json({ success: true, scheme });
  } catch (error) {
    console.error('Error updating scheme:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete scheme (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    
    res.json({ success: true, message: 'Scheme deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheme:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
