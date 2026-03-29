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
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET || 'secret_session',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Render Health Check
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./db');
    await db.query('SELECT 1');
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Health Check Failure:', err.message);
    res.status(503).json({ status: "unhealthy", error: "Database unreachable" });
  }
});

app.get('/', (req, res) => {
  res.json({ status: "OK", service: "TeamFinder API" });
});

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
  console.error("ERROR:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Phase 1 - Safe Boot Process
const PORT = process.env.PORT || 5000;

try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Server startup error:', error.message);
    process.exit(1);
  });
} catch (err) {
  console.error('Failed to boot server:', err.message);
  process.exit(1);
}