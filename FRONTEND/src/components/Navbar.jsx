import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api';
import { useAuth } from '../context/AuthContext';
import { Rocket, Search, LayoutDashboard, PlusCircle, LogOut, LogIn, User, Compass, Trophy, Star, Bell, Check } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      const fetchNotifs = () => {
        getNotifications().then(data => {
          if (Array.isArray(data)) setNotifications(data);
        }).catch(() => {});
      };
      fetchNotifs();
      interval = setInterval(fetchNotifs, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass" style={{ position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid var(--border-muted)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 'var(--space-xxl)' }}>
        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em' }}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px', display: 'flex', boxShadow: '0 0 15px var(--primary-soft)' }}>
            <Rocket color="black" size={20} />
          </div>
          <span className="text-gradient">TeamFinder</span>
        </Link>
        
        <div className="nav-search-wrap" style={{ flex: 1, maxWidth: '450px', margin: '0 40px' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search projects or matches..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.2s' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </form>
        </div>

        <div className="nav-links" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/explore" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s' }}>Explore</Link>
          <Link to="/hackathons" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s' }}>Hackathons</Link>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: '8px', color: showNotifications ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--primary)', color: 'black', fontSize: '0.65rem', fontWeight: 900, borderRadius: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-dark)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="glass" style={{ position: 'absolute', top: 'calc(100% + 16px)', right: '-10px', width: '380px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>Mark all read</button>
                      )}
                    </div>
                    <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No new signals found.</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n)}
                            style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-muted)', cursor: 'pointer', background: n.is_read ? 'transparent' : 'var(--primary-soft)', transition: 'background 0.2s' }}
                          >
                            <p style={{ margin: '0 0 6px 0', color: n.is_read ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5 }}>{n.message}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--border-light)' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-muted)' }}></div>

              <Link to={`/profile/${user?.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                <img 
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=ff7a18&color=000`} 
                  alt="" 
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid var(--border-light)', objectFit: 'cover' }} 
                />
                <span className="nav-user-name">{user?.name.split(' ')[0]}</span>
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="btn-secondary"
                style={{ padding: '8px', border: 'none', minWidth: 'auto', color: 'var(--text-muted)' }}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-premium">
              <LogIn size={18} /> Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

