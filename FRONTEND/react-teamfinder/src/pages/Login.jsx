import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPass, setDemoPass] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const fillDemoUser = () => {
    setDemoEmail('demo@teamfinder.io');
    setDemoPass('demo123');
    setEmail('demo@teamfinder.io');
    setPassword('demo123');
    setError('');
  };

  const fillPowerUser = () => {
    setDemoEmail('alex@teamfinder.io');
    setDemoPass('power456');
    setEmail('alex@teamfinder.io');
    setPassword('power456');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-split">
        <div className="login-left">
          <div className="login-left-grid"></div>
          <div>

            <Link to="/" className="login-brand-logo flex items-center gap-3 mb-8 font-bold text-xl no-underline">
              <div className="login-brand-icon w-11 h-11 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-xl shadow-2xl">🚀</div>
              <span>Team<span className="logo-white">Finder</span></span>
            </Link>
            <h2 className="login-headline text-4xl md:text-5xl font-black leading-tight mb-4">
              Build amazing <span className="gradient-text">things together.</span>
            </h2>
            <p className="login-sub text-lg text-text-secondary mb-8 leading-relaxed">
              Join thousands of builders using TeamFinder to find collaborators and ship products people love.
            </p>
            <div className="login-perks space-y-3">
              <div className="login-perk flex items-center gap-3 text-text-secondary">
                <div className="login-perk-icon w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">🎯</div>
                Discover projects matching your exact skill set
              </div>
              <div className="login-perk flex items-center gap-3 text-text-secondary">
                <div className="login-perk-icon w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">🤝</div>
                Build alongside talented engineers and designers
              </div>
              <div className="login-perk flex items-center gap-3 text-text-secondary">
                <div className="login-perk-icon w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg">🚀</div>
                From idea to launch with the right team
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="login-right bg-black p-12 flex flex-col justify-center">
          <div className="login-form-wrap max-w-md w-full mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-muted mb-8 hover:text-text-primary transition-colors">
              ← Back to home
            </Link>
            <h1 className="login-title text-2xl font-black mb-2">Welcome back</h1>
            <p className="login-desc text-text-secondary mb-8">Sign in to your TeamFinder account</p>

            <div className="login-divider text-xs text-text-muted my-4 flex items-center gap-3 before:flex-1 before:h-px before:bg-border after:flex-1 after:h-px after:bg-border">
              Quick fill
            </div>

            <div className="quick-fill-btns grid grid-cols-2 gap-2 mb-6">
              <button className="quick-fill-btn p-2 bg-bg-surface border border-border rounded-md text-xs font-medium text-text-secondary hover:bg-bg-card hover:text-text-primary transition-all" onClick={fillDemoUser}>
                👤 Demo User
              </button>
              <button className="quick-fill-btn p-2 bg-bg-surface border border-border rounded-md text-xs font-medium text-text-secondary hover:bg-bg-card hover:text-text-primary transition-all" onClick={fillPowerUser}>
                ⚡ Power User
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label block text-sm font-medium text-text-secondary mb-2">Email address</label>
                <div className="input-with-icon relative">
                  <Mail className="input-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                  <input
                    className="form-input w-full pl-11 pr-4 py-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:border-accent-1 focus:ring-1 focus:ring-accent-glow focus:bg-bg-card transition-all"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label block text-sm font-medium text-text-secondary mb-2">Password</label>
                <div className="input-with-icon relative">
                  <Lock className="input-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                  <input
                    className="form-input w-full pl-11 pr-12 py-3 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:border-accent-1 focus:ring-1 focus:ring-accent-glow focus:bg-bg-card transition-all"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:text-text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-text-secondary">
                  <input type="checkbox" className="rounded" id="remember" />
                  Remember me
                </label>
                <a href="#" className="text-accent-1 hover:underline font-medium" onClick={(e) => { e.preventDefault(); alert('Password reset coming soon!'); }}>
                  Forgot password?
                </a>
              </div>

              <button 
                type="submit" 
                className="btn-submit-wrap w-full relative"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner mx-auto" />
                ) : (
                  'Sign In →'
                )}
              </button>
            </form>

            {error && (
              <p className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </p>
            )}

            <p className="login-footer-text text-center text-xs text-text-secondary mt-6">
              Don't have an account? <Link to="/register" className="text-accent-1 font-semibold hover:underline">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

