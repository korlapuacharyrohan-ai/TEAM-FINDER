import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ErrorBoundary, { Toaster } from './components/ErrorBoundary.jsx';

import Login from './pages/Login.jsx';
import Landing from './pages/Landing.jsx';
import './index.css';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar />
        <main className="page-wrap">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<div>Dashboard Coming Soon</div>} />
            <Route path="/find-team" element={<div>Find Team Coming Soon</div>} />
            <Route path="/create-project" element={<div>Create Project Coming Soon</div>} />
            <Route path="/project/:id" element={<div>Project Details Coming Soon</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </ErrorBoundary>
  );
}



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

