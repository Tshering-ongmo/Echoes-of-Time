const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../Middleware/authMiddleware');
const userController = require('../controllers/userController');
const { body } = require('express-validator');

// Dashboard route (protected)
router.get('/dashboard', isAuthenticated, userController.getDashboard);

// Narration routes (public)
router.get('/narration', userController.getStories);
router.get('/narration/:id', userController.getSingleStory);

// About us page (public)
router.get('/about', userController.getAboutPage);

// Testimonials routes
// Show testimonials page
router.get('/testimonials', userController.showTestimonialsPage);

// Submit a new testimonial (add validation if needed)
router.post(
  '/testimonials',
  [
    body('user_name').notEmpty().withMessage('Name is required'),
    body('user_email').isEmail().withMessage('Valid email is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
  ],
  userController.submitTestimonial
);

module.exports = router;
// This code defines the user routes for the application, including protected routes for the user dashboard and public routes for narration, about us, and testimonials. It uses middleware to ensure that certain routes are only accessible to authenticated users. The testimonials submission route includes validation checks for the input fields.