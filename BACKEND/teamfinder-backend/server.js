require('dotenv').config();

// Process Safety - Catch all uncaught errors
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err.message || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Environment Validation
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET'];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing mandatory environment variable: ${envVar}`);
  }
}

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');


const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const hackathonRoutes = require('./routes/hackathons');
const notificationRoutes = require('./routes/notifications');
const joinRequestRoutes = require('./routes/join-requests');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

const db = require('./db');
app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok' });
  } catch (e) {
    res.status(503).json({ status: 'error', db: e.message });
  }
});

app.use(session({
  secret: process.env.JWT_SECRET || 'secret_session',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Health checks already implemented above

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/join-requests', joinRequestRoutes);

// Phase 4 - Global API Fallback Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// Phase 1 - Safe Boot Process
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});