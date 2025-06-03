const db = require('../config/db');
const Testimonial = require('../Models/testimonialModel');

// ========== DASHBOARD ==========
exports.getDashboard = (req, res) => {
  res.render('user/dashboard', { message: null });
};

// ========== STORIES ==========
exports.getStories = async (req, res, next) => {
  try {
    const stories = await db.any(`
      SELECT *, created_at AS "createdAt" 
      FROM stories 
      WHERE published = TRUE 
      ORDER BY created_at DESC
    `);

    const formattedStories = stories.map(story => ({
      ...story,
      createdAt: story.createdAt ? new Date(story.createdAt) : null,
      formattedDate: story.createdAt
        ? new Date(story.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Date not available',
    }));

    res.render('user/narration', {
      title: 'Stories of Bhutan',
      stories: formattedStories,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSingleStory = async (req, res, next) => {
  try {
    const story = await db.one(
      `SELECT *, created_at AS "createdAt" 
       FROM stories 
       WHERE id = $1 AND published = TRUE`,
      [req.params.id]
    );

    const formattedStory = {
      ...story,
      createdAt: story.createdAt ? new Date(story.createdAt) : null,
      formattedDate: story.createdAt
        ? new Date(story.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Date not available',
    };

    res.render('storyDetail', {
      title: story.title,
      story: formattedStory,
    });
  } catch (err) {
    if (err.code === db.errors.queryResultErrorCode.noData) {
      return next(new Error('Story not found or not published yet'));
    }
    next(err);
  }
};

// ========== ABOUT ==========
exports.getAboutPage = (req, res) => {
  try {
    res.render('user/about', {
      title: 'About Us - Echoes of Time',
    });
  } catch (err) {
    console.error('Error rendering about page:', err);
    res.status(500).render('error', { message: 'Error loading about page' });
  }
};

// ========== TESTIMONIALS ==========

// Show approved testimonials to users
exports.showTestimonialsPage = async (req, res) => {
  try {
    const testimonials = await db.any(
      `SELECT * FROM testimonials 
       WHERE is_approved = TRUE 
       ORDER BY created_at DESC`
    );
    res.render('user/testimonials', { testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).render('error', { message: 'Error loading testimonials' });
  }
};

// Handle user testimonial submission
exports.submitTestimonial = async (req, res) => {
  try {
    const { user_name, user_email, content, rating } = req.body;

    if (!user_name || !user_email || !content || !rating) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    await db.one(
      `INSERT INTO testimonials(user_name, user_email, content, rating) 
       VALUES($1, $2, $3, $4) 
       RETURNING *`,
      [user_name, user_email, content, rating]
    );

    res.status(200).json({
      success: true,
      message: 'Testimonial submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting testimonial',
    });
  }
};

// Get testimonials by a specific user
exports.getUserTestimonials = async (req, res) => {
  try {
    const { email } = req.params;
    const testimonials = await db.any(
      `SELECT * FROM testimonials 
       WHERE user_email = $1 
       ORDER BY created_at DESC`,
      [email]
    );
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching user testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching testimonials',
    });
  }
};
// Delete a user's testimonial
