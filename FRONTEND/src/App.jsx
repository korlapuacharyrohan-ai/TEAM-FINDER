import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FindTeam from './pages/FindTeam';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/find-team" replace />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/find-team" element={<FindTeam />} />
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}
