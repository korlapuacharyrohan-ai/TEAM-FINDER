import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../api';
import { Trophy, Star, ExternalLink, GitBranch, Medal } from 'lucide-react';

export default function Showcase() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjects({ is_completed: true });
        setProjects(data);
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>Curating Hall of Fame...</div>;
  if (error) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#ff4444', margin: '2rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>;

  return (
    <div className="container" style={{ padding: 'var(--space-xxl) var(--space-md)' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px', position: 'relative' }}>
         {/* Background Accent */}
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)', opacity: 0.2, zIndex: -1 }}></div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '10px 24px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', border: '1px solid rgba(255,122,24,0.1)' }}>
          <Trophy size={18} /> Elite Creations
        </div>
        <h1 className="text-gradient" style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '24px' }}>
          Hall of Fame
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
          The definitive archive of high-impact products conceived, developed, and deployed by organic teams formed on TeamFinder.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="card-premium" style={{ textAlign: 'center', padding: '100px 40px', borderRadius: '32px', borderStyle: 'dashed' }}>
          <Trophy size={64} style={{ color: 'var(--border-muted)', marginBottom: '24px', opacity: 0.5 }} />
          <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Zero-Signal Archive</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>No initiatives have reached terminal completion yet. Be the first to build a legacy.</p>
          <Link to="/explore" className="btn-premium" style={{ marginTop: '32px', height: '52px', padding: '0 32px' }}>Start Building</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '40px' }}>
          {projects.map((p) => (
            <Link to={`/project/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div className="card-premium" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '12px', borderRadius: '32px' }}>
                <div style={{ position: 'relative', height: '260px', borderRadius: '24px', overflow: 'hidden', marginBottom: '24px' }}>
                  <img 
                    src={p.thumbnail_url || `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800`} 
                    alt={p.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8))' }}></div>
                  
                  {p.hackathon_result && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', color: '#ffd700', padding: '8px 16px', borderRadius: '14px', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,215,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Medal size={16} /> {p.hackathon_result}
                    </div>
                  )}
                  
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ background: 'var(--bg-dark)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-muted)', fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                        Mission Complete
                     </div>
                  </div>
                </div>

                <div style={{ padding: '0 16px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '16px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{p.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '24px', fontWeight: 500 }}>
                    {p.description}
                  </p>
                  
                  <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {p.skills && p.skills.slice(0, 2).map((skill, index) => (
                         <span key={index} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
                            #{skill}
                         </span>
                      ))}
                      {p.skills && p.skills.length > 2 && <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800 }}>+{p.skills.length - 2}</span>}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                       {p.demo_url && (
                         <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 800 }}>
                           LINKED <ExternalLink size={18} />
                         </div>
                       )}
                       <div style={{ background: 'var(--bg-darker)', color: 'white', padding: '10px 18px', borderRadius: '14px', fontWeight: 800, fontSize: '0.85rem', border: '1px solid var(--border-muted)' }}>
                          VIEW CASE
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
