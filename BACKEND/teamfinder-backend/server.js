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
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing mandatory environment variable: ${envVar}`);
    process.exit(1);
  }
}

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Phase 5 - Hardened CORS Configuration
app.use(cors({
  origin: "https://teamfinder-frontend.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

app.use(express.json());

// Phase 6 - Health Checks
app.get('/', (req, res) => {
  res.send('TeamFinder API is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Phase 4 - Global API Fallback Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Phase 1 - Safe Boot Process
const PORT = process.env.PORT;

try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server safely started on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Server startup error:', error.message);
    process.exit(1);
  });
} catch (err) {
  console.error('Failed to boot server:', err.message);
  process.exit(1);
}