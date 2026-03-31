# TeamFinder: Full-Stack Project Collaboration Platform

A professional-grade application designed to bridge technical gaps by connecting developers based on skill overlap and mission alignment. Featuring AI-driven teammate recommendations, secure GitHub OAuth authentication, and a real-time notification system.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Lucide Icons, Glassmorphic UI/UX.
- **Backend**: Node.js, Express, Passport.js (GitHub Strategy).
- **Database**: PostgreSQL (Structured Schema with JSON/Array optimized fields).
- **Intelligence**: Google Gemini 1.5 Flash (Teammate Suggestion Engine).

---

## 🛠️ Rapid Setup Guide

### 1. Database Configuration
Ensure a PostgreSQL instance is running. You can use a local instance or a managed service like Neon or Render.

### 2. Backend Orchestration
```bash
cd BACKEND/teamfinder-backend
npm install
# Configure .env based on .env.example
npm start
```

### 3. Frontend Interface
```bash
cd FRONTEND
npm install
# Configure .env.example with VITE_API_BASE
npm run dev
```

---

## 🔐 Environment Variables Guide

### Backend (`/BACKEND/teamfinder-backend/.env`)
- `DATABASE_URL`: Full PostgreSQL connection string.
- `JWT_SECRET`: Secret key for session encryption.
- `FRONTEND_URL`: URL to redirect after OAuth (Default: `http://localhost:5173`).
- `GOOGLE_AI_KEY`: API Key for Gemini 1.5 Flash.
- `GITHUB_CLIENT_ID` / `SECRET`: OAuth credentials from GitHub Developer Settings.

### Frontend (`/FRONTEND/.env`)
- `VITE_API_BASE`: The base URL for the Backend API.

---

## 🌐 Deployment Notes

### Backend (Render / Heroku / Fly.io)
- Ensure all Environment Variables are set in the provider's dashboard.
- The project is configured to auto-migrate the schema on first connection.
- Set `NODE_ENV=production` for secure cookie transmission.

### Frontend (Vercel / Netlify)
- Point the build command to `npm run build`.
- Environment variables must include the Production Backend URL in `VITE_API_BASE`.

---

## ⚖️ License
Internal Use / Private Handoff. 
"Production-ready refactor: stability, security, env config, and deployment setup"
