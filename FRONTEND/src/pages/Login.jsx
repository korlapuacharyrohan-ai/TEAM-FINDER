import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi, API_BASE } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/explore', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await loginApi(email, password);
      } else {
        data = await registerApi(name || email.split('@')[0], email, password);
      }
      
      if (data.success && data.user) {
        setUser(data.user);
        navigate('/explore');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  return (
    <div style={{ minHeight: '94vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-darker)', padding: '20px' }}>
      <div className="glass" style={{ maxWidth: '440px', width: '100%', padding: '48px', borderRadius: '32px', border: '1px solid var(--border-muted)', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle Background Glow */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '250px', height: '250px', background: 'radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)', opacity: 0.4, zIndex: -1 }}></div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.04em' }}>
            {isLogin ? 'Welcome back' : 'Join the matrix'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>
            {isLogin ? 'Sign in to access your active teams' : 'Create an account and start building'}
          </p>
        </div>

        {error && (
          <div style={{ color: '#ff4444', marginBottom: '24px', padding: '16px', background: 'rgba(255,68,68,0.08)', borderRadius: '16px', border: '1px solid rgba(255,68,68,0.2)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
              <input 
                type="text" 
                style={{ width: '100%', padding: '16px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '16px', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }} 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="Janus Smith"
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email address</label>
            <input 
              type="email" 
              style={{ width: '100%', padding: '16px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '16px', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }} 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="operator@nexus.io"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input 
              type="password" 
              style={{ width: '100%', padding: '16px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '16px', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6} 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-premium" style={{ width: '100%', justifyContent: 'center', height: '58px', borderRadius: '18px', fontSize: '1.1rem', marginTop: '12px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Authenticate' : 'Initialize')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0', gap: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-muted)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-muted)' }}></div>
          </div>

          <button 
            type="button"
            onClick={handleGitHubLogin}
            className="btn-secondary"
            style={{ 
              width: '100%',
              justifyContent: 'center',
              height: '58px',
              borderRadius: '18px',
              fontSize: '1.05rem',
              gap: '12px',
              background: '#24292e',
              border: 'none',
              color: 'white'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            Sign in with GitHub
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem' }}>
            {isLogin ? 'Create one free' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

