import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exchangeCodeForToken } from '../api';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const hasCalledExchange = useRef(false);

  useEffect(() => {
    if (hasCalledExchange.current) return;
    
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      // Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      hasCalledExchange.current = true;
      
      exchangeCodeForToken(code)
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
            navigate('/explore', { replace: true });
          } else {
            navigate('/login?error=exchange_failed', { replace: true });
          }
        })
        .catch(err => {
          console.error("Exchange failed:", err);
          navigate('/login?error=auth_error', { replace: true });
        });
    } else {
      navigate('/login?error=no_code', { replace: true });
    }
  }, [location, navigate, setUser]);

  return (
    <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-darker)', minHeight: '94vh', textAlign: 'center' }}>
      <div className="loader" style={{ marginBottom: '40px' }}></div>
      <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.04em' }}>Finalizing Authentication</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto', fontWeight: 500, lineHeight: 1.6 }}>
        Establishing your secure session with the network. You will be redirected to your dashboard shortly.
      </p>
      
      <div style={{ marginTop: '40px', padding: '12px 24px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(255,122,24,0.1)' }}>
        Authorized Access Only
      </div>
    </div>
  );
}

