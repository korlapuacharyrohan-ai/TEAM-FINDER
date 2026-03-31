require('dotenv').config();

// Process Safety - Catch all uncaught errors
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err.message || err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Environment Validation
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET'];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing mandatory environment variable: ${envVar}`);
    process.exit(1);
  }
}

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');


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
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

const db = require('./db');

// Health Check Endpoint (Lightweight, non-DB dependent)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) => res.json({ status: 'ok' }));

// Auth Rate Limiting (Production Security)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many authentication attempts — please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(session({
  secret: process.env.JWT_SECRET || 'secret_session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

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

// Phase 1 - Safe Boot Process
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});