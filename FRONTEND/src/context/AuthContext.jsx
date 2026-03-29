import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logoutApi } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in via httpOnly cookie
    getMe()
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('userId', data.user.id);
        }
      })
      .catch(() => {
        // Not logged in or session expired
        setUser(null);
        localStorage.removeItem('userId');
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userId', userData.id);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
