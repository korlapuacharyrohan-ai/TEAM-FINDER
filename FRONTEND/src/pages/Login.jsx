import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi } from '../api';

export default function Login({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginApi(email, password);
      } else {
        await registerApi(name || email.split('@')[0], email, password);
      }
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-split" style={{ maxWidth: '420px', width: '100%', margin: '40px auto', background: '#0a0a0a', padding: '2.5rem', borderRadius: '16px', border: '1px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <h1 className="login-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="login-desc" style={{ marginBottom: '24px', color: '#888', fontSize: '0.95rem' }}>
          {isLogin ? 'Sign in to access your projects and teams.' : 'Join the platform to start building.'}
        </p>

        {error && (
          <div style={{ color: '#ff4444', marginBottom: '20px', padding: '12px', background: 'rgba(255,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(255,68,68,0.2)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Name</label>
              <input type="text" style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px', transition: 'border-color 0.2s' }} value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Email address</label>
            <input type="email" style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px', transition: 'border-color 0.2s' }} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Password</label>
            <input type="password" style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px', transition: 'border-color 0.2s' }} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #ff7a18, #af002d)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: '12px', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In →' : 'Sign Up →')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: '#888', fontSize: '0.9rem', paddingTop: '20px', borderTop: '1px solid #222' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ background: 'none', border: 'none', color: '#ff7a18', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            {isLogin ? 'Create one free' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
