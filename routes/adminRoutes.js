const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../Middleware/authMiddleware');
const upload = require('../utils/multerConfig');
const multer = require('multer');

// Protect all admin routes
router.use(isAdmin);

// Admin Dashboard
router.get('/dashboard', adminController.getDashboard);

// ==== STORY ROUTES ====

// Show form to add a new story
router.get('/addStory', adminController.getAddStoryForm);

// Create a new story with optional image upload
router.post(
  '/addStory',
  (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File upload error', details: err.message });
      } else if (err) {
        return res.status(500).json({ error: 'Server error', details: err.message });
      }
      next();
    });
  },
  adminController.createStory
);

// View all stories
router.get('/viewStories', adminController.getAllStories);

// Get single story data (for editing or preview)
router.get('/stories/:id', adminController.getStoryById);

// Update a story (title/content)
router.put('/stories/:id', adminController.updateStory);

// Delete a story
router.delete('/stories/:id', adminController.deleteStory);

// Publish a story
router.post('/stories/:id/publish', adminController.publishStory);

// Add images to an existing story
router.post(
  '/stories/:id/images',
  upload.array('images', 5),
  adminController.addStoryImages
);

// ==== TESTIMONIAL ROUTES ====

// View all pending testimonials
router.get('/testimonials', adminController.getPendingTestimonials);

// Approve a testimonial
router.post('/approveTestimonial/:id', adminController.approveTestimonial);

// Delete a testimonial
router.post('/deleteTestimonial/:id', adminController.deleteTestimonial);

module.exports = router;
