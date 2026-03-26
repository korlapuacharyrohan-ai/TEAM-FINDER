import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const handleGetStarted = (e) => {
    if (isAuthenticated) {
      e.preventDefault();
      window.location.href = '/dashboard';
    }
  };

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Now in Beta — Join 2,000+ builders
          </div>
          <h1 className="hero-title">
            Find Your<br />
            <span className="gradient-text">Dream Team.</span>
          </h1>
          <p className="hero-subtitle">
            TeamFinder connects ambitious builders, designers, and creators with the right
            teammates. Discover exciting projects, join teams, and ship together.
          </p>
          <div className="hero-actions">
            <Link 
              to="/login" 
              className="btn btn-cta btn-lg" 
              onClick={handleGetStarted}
              id="hero-get-started"
            >
              Get Started Free →
            </Link>
            <Link to="/find-team" className="btn btn-secondary btn-lg">
              Browse Projects
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">2K+</div>
              <div className="hero-stat-label">Active Builders</div>
            </div>
            <div className="hero-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-num">150+</div>
              <div className="hero-stat-label">Live Projects</div>
            </div>
            <div className="hero-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-num">95%</div>
              <div className="hero-stat-label">Match Success</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Built for builders</span>
            <h2 className="section-title">Everything you need to <span className="gradient-text">build together</span></h2>
            <p className="section-subtitle">From discovery to launch — TeamFinder powers every stage of collaborative development.</p>
          </div>
          <div className="features-grid">
            <div className="card feature-card animate-fade-up-delay-1">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Smart Matching</h3>
              <p className="feature-text">Our algorithm matches you with projects based on your skills, availability, and interests — no more scrolling through irrelevant listings.</p>
            </div>
            <div className="card feature-card animate-fade-up-delay-2">
              <div className="feature-icon">🤝</div>
              <h3 className="feature-title">Team Discovery</h3>
              <p className="feature-text">Browse hundreds of active projects across AI, Web3, SaaS, and more. Filter by stack, duration, and remote options.</p>
            </div>
            <div className="card feature-card animate-fade-up-delay-3">
              <div className="feature-icon">🛠</div>
              <h3 className="feature-title">Project Management</h3>
              <p className="feature-text">Create and manage your project listings, track applicants, and fill your team with the exact skill set you need.</p>
            </div>
            <div className="card feature-card animate-fade-up-delay-1">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Direct Connect</h3>
              <p className="feature-text">Skip the middleman. Request to join, get accepted, and start collaborating immediately through your preferred tools.</p>
            </div>
            <div className="card feature-card animate-fade-up-delay-2">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Remote First</h3>
              <p className="feature-text">Work from anywhere. All projects support async collaboration, with timezone-friendly teams across 60+ countries.</p>
            </div>
            <div className="card feature-card animate-fade-up-delay-3">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Launch Fast</h3>
              <p className="feature-text">Get from idea to team in hours, not weeks. Our streamlined process means you can start building the next day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to build something <span className="gradient-text">extraordinary?</span></h2>
            <p className="cta-sub">Join thousands of developers who found their best teammates on TeamFinder.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-cta btn-lg" onClick={handleGetStarted}>Start Building Free →</Link>
              <Link to="/find-team" className="btn btn-secondary btn-lg">Explore Projects</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Landing;

