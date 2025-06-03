const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const flash = require('connect-flash');
const methodOverride = require('method-override');
const { Pool } = require('pg');
require('dotenv').config();

const { createUserTable } = require('./Models/userModel');
const { createStoryTable } = require('./Models/storyModel');
const { createTestimonialsTable } = require('./Models/testimonialModel');

const app = express();
const PORT = process.env.PORT || 2004;

// === PostgreSQL Pool for Session Store ===
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// === Middlewares ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// === Static files ===
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// === Session setup using connect-pg-simple ===
app.use(
  session({
    store: new pgSession({
      pool: pgPool,
      tableName: 'session', // optional
    }),
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// === Flash ===
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// === Method override for PUT/DELETE ===
app.use(methodOverride('_method'));

// === View engine ===
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// === Routes ===
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// === Table Creation ===
createUserTable();
createStoryTable();
createTestimonialsTable();

// === Start server ===
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
