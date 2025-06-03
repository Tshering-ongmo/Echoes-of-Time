const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to check if user is authenticated (admin or regular user)
exports.isAuthenticated = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (!user) return res.redirect('/login');

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.email === process.env.ADMIN_EMAIL
    };

    next();
  } catch (err) {
    return res.redirect('/login');
  }
};

// Middleware to restrict access to admin-only routes
exports.isAdmin = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return res.redirect('/user/dashboard');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: true
    };

    next();
  } catch (err) {
    return res.redirect('/login');
  }
};
