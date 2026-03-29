import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Hackathons from './pages/Hackathons';
import HackathonDetails from './pages/HackathonDetails';
import Showcase from './pages/Showcase';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#888' }}>
        Authenticating...
      </div>
    );
  }

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/explore" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-success" element={<OAuthCallback />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/hackathon/:id" element={<HackathonDetails />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-project" 
            element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            } 
          />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

