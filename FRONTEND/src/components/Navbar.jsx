import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutApi } from '../api';
import { Rocket, Search, LayoutDashboard, PlusCircle, LogOut, LogIn } from 'lucide-react';

export default function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutApi();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem 2rem' }}>
        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.4rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #ff7a18, #af002d)', padding: '6px', borderRadius: '8px' }}>
            <Rocket color="white" size={20} />
          </div>
          <span style={{ letterSpacing: '-0.03em' }}>TeamFinder</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/find-team" style={{ color: '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>
            <Search size={16} /> Find Team
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ color: '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/create-project" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #333', color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
                <PlusCircle size={16} /> Create Project
              </Link>
              <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ background: '#ff7a18', color: 'black', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              <LogIn size={16} /> Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
