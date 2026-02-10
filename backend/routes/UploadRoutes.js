const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'), false);
        }
    }
});

// Upload image to Cloudinary
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }

        // Check if Cloudinary is configured
        const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                        process.env.CLOUDINARY_API_KEY && 
                                        process.env.CLOUDINARY_API_SECRET;

        if (!isCloudinaryConfigured) {
            // Fallback: Convert to base64 data URL (works without Cloudinary for development)
            const base64 = req.file.buffer.toString('base64');
            const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
            return res.json({
                success: true,
                url: dataUrl,
                message: 'Image uploaded (local base64 - configure Cloudinary for production)'
            });
        }

        // Upload to Cloudinary via stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'agrimarket/produce',
                    resource_type: 'image',
                    transformation: [
                        { width: 800, height: 600, crop: 'limit' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            message: 'Image uploaded successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        if (error.message?.includes('File too large')) {
            return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
        }
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
});

// Delete image from Cloudinary
router.delete('/:publicId', verifyToken, async (req, res) => {
    try {
        const { publicId } = req.params;
        await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete image' });
    }
});

module.exports = router;
