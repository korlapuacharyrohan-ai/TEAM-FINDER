import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, respondToProjectRequest } from '../api';
import { CheckCircle, XCircle, Rocket } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    loadDash();
  }, []);

  async function loadDash() {
    try {
      setLoading(true);
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleResponse = async (requestId, status) => {
    try {
      await respondToProjectRequest(requestId, status);
      loadDash();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>Loading Dashboard secure gateway...</div>;
  if (error) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#ff4444', margin: '2rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>;

  return (
    <div className="container" style={{ padding: 'var(--space-xxl) var(--space-md)' }}>
      {/* Header / Hero Section */}
      <div className="glass" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xxl)', padding: 'var(--space-xl)', borderRadius: '28px', border: '1px solid var(--border-muted)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '12px' }}>Welcome back, {data.user.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', fontWeight: 500, lineHeight: 1.6 }}>Orchestrate your active teams and scout for high-probability opportunities across the network.</p>
        </div>
        <Link to="/create-project" className="btn-premium" style={{ height: '56px', padding: '0 32px', borderRadius: '16px', fontSize: '1.05rem' }}>
          Launch Initiative
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: 'var(--space-xl)' }}>
         <div className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Active Projects</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{data.projects?.length || 0}</div>
         </div>
         <div className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Signals Pending</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{data.requests?.length || 0}</div>
         </div>
         <div className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Network Rank</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>Top 5%</div>
         </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-xl)', paddingBottom: '16px', borderBottom: '1px solid var(--border-muted)' }}>
        <button 
          onClick={() => setActiveTab('projects')}
          className={activeTab === 'projects' ? 'btn-premium' : 'btn-secondary'}
          style={{ padding: '10px 24px', borderRadius: '12px', minWidth: 'auto' }}
        >
          Your Catalog {data.projects && `(${data.projects.length})`}
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={activeTab === 'requests' ? 'btn-premium' : 'btn-secondary'}
          style={{ padding: '10px 24px', borderRadius: '12px', minWidth: 'auto' }}
        >
          Recruitment Ops {data.requests && data.requests.length > 0 && `(${data.requests.length})`}
        </button>
      </div>

      {activeTab === 'projects' ? (
        <div style={{ marginBottom: '40px' }}>
          {(!data.projects || data.projects.length === 0) ? (
            <div style={{ background: 'var(--bg-card)', padding: '6rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border-muted)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Zero active initiatives found in your local matrix.</p>
              <Link to="/explore" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 800, display: 'block', marginTop: '16px' }}>Scan for open signals →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {data.projects.map(p => (
                <Link to={`/project/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                  <div className="card-premium" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {p.thumbnail_url && (
                        <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border-muted)' }}>
                          <img src={p.thumbnail_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <span style={{ display: 'inline-block', padding: '6px 12px', background: p.is_completed ? 'rgba(16,185,129,0.1)' : 'var(--primary-soft)', color: p.is_completed ? '#10b981' : 'var(--primary)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {p.is_completed ? 'Completed' : p.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '12px', lineHeight: 1.25 }}>{p.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: '40px' }}>
          {(!data.requests || data.requests.length === 0) ? (
            <div style={{ background: 'var(--bg-card)', padding: '6rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--border-muted)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No applicants currently attempting to bridge with your teams.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {data.requests.map(req => (
                <div key={req.id} className="card-premium" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', minWidth: '280px' }}>
                     <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'var(--bg-darker)', border: '2px solid var(--primary)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {req.avatar_url ? (
                          <img src={req.avatar_url} alt={req.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: 'white', fontSize: '1.75rem', fontWeight: 900 }}>{req.user_name.charAt(0)}</span>
                        )}
                     </div>
                     <div>
                       <Link to={`/profile/${req.user_id}`} style={{ textDecoration: 'none' }}>
                         <h3 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 800 }}>{req.user_name}</h3>
                       </Link>
                       <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{req.availability || 'Available'}</span>
                     </div>
                  </div>
                  
                  <div style={{ flex: 2, minWidth: '300px' }}>
                    <div style={{ marginBottom: '16px', display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                      <span>Sector: <span style={{ color: 'white' }}>{req.project_title}</span></span>
                      <span>Target: <span style={{ color: 'var(--primary)' }}>{req.role}</span></span>
                    </div>
                    {req.message && (
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid var(--primary)', marginBottom: '20px' }}>
                        <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6 }}>"{req.message}"</p>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {req.user_skills && req.user_skills.slice(0, 5).map((skill, index) => (
                         <span key={index} style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(255,122,24,0.1)' }}>
                            {skill}
                         </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', minWidth: '100%', borderTop: '1px solid var(--border-muted)', paddingTop: '28px', marginTop: '8px' }}>
                     <button onClick={() => handleResponse(req.id, 'accepted')} className="btn-premium" style={{ flex: 1, minWidth: '180px', height: '52px', justifyContent: 'center', borderRadius: '14px' }}>
                       Recruit Candidate
                     </button>
                     <button onClick={() => handleResponse(req.id, 'rejected')} className="btn-secondary" style={{ flex: 1, minWidth: '180px', height: '52px', justifyContent: 'center', borderRadius: '14px', color: '#ff4444', borderColor: 'rgba(255,68,68,0.2)' }}>
                       Archive Signal
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
