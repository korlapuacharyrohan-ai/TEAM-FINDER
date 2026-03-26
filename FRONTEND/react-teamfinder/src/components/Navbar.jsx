import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/find-team', label: '🔍 Find Teams', protected: false },
    { to: '/create-project', label: '➕ Create Project', protected: true },
    { to: '/dashboard', label: '📊 Dashboard', protected: true },
  ];

  const currentPath = location.pathname;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🚀</div>
            <span className="nav-logo-text">
              <span className="logo-white">Team</span>
              <span className="logo-orange">Finder</span>
            </span>
          </Link>

          <ul className="nav-links">
            {navLinks.map(({ to, label, protected: prot }) => (
              (prot && !isAuthenticated) ? null : (
                <li key={to}>
                  <Link 
                    to={to} 
                    className={`nav-link ${currentPath === to ? 'active' : ''}`}
                  >
                    {label}
                  </Link>
                </li>
              )
            ))}
          </ul>

          <div className="nav-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                <Link to="/login" className="btn btn-cta btn-sm">Get Started →</Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
                <div className="avatar nav-user-avatar" style={{ cursor: 'pointer' }} onClick={() => {}}>
                  {user?.initials || '??'}
                </div>
              </div>
            )}
          </div>

          <button 
            className="nav-hamburger" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`nav-mobile ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(({ to, label, protected: prot }) => (
          (prot && !isAuthenticated) ? null : (
            <Link 
              key={to} 
              to={to} 
              className={`nav-link ${currentPath === to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          )
        ))}
        {!isAuthenticated ? (
          <Link to="/login" className="btn btn-cta btn-sm" style={{ marginTop: '8px' }}>
            Get Started
          </Link>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={signOut} style={{ marginTop: '8px', width: '100%' }}>
            🚪 Log Out
          </button>
        )}
      </div>
    </>
  );
};

export default Navbar;

