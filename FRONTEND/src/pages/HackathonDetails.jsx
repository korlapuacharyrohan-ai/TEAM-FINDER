import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHackathon } from '../api';
import { Trophy, Calendar, ExternalLink, ChevronLeft, Loader2, Users } from 'lucide-react';

export default function HackathonDetails() {
  const { id } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getHackathon(id);
        setHackathon(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}><Loader2 className="animate-spin" size={32} color="#888" /></div>;
  if (error) return <div style={{ padding: '20px', color: '#ff4444', textAlign: 'center', margin: '4rem auto', maxWidth: '600px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>;

  return (
    <div className="container" style={{ padding: 'var(--space-xxl) var(--space-md)' }}>
      <Link to="/hackathons" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '32px', fontSize: '1rem', fontWeight: 600, transition: 'color 0.2s' }}>
        <ChevronLeft size={18} /> BACK TO ARENAS
      </Link>

      <div className="glass" style={{ padding: '60px', borderRadius: '40px', border: '1px solid var(--border-muted)', marginBottom: '60px', position: 'relative', overflow: 'hidden' }}>
         {/* Background Decor */}
        <Trophy size={400} color="rgba(16,185,129,0.03)" style={{ position: 'absolute', right: '-100px', bottom: '-100px', zIndex: 0, transform: 'rotate(-15deg)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '10px 20px', borderRadius: '16px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', border: '1px solid rgba(16,185,129,0.1)' }}>
            <Calendar size={16} /> LIVE TRACK
          </div>
          
          <h1 className="text-gradient" style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '24px' }}>{hackathon.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '800px', lineHeight: 1.6, marginBottom: '40px', fontWeight: 500 }}>
            {hackathon.description}
          </p>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div style={{ background: 'var(--bg-darker)', padding: '20px 32px', borderRadius: '24px', border: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Prize Pool</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{hackathon.prize}</span>
            </div>
            <div style={{ background: 'var(--bg-darker)', padding: '20px 32px', borderRadius: '24px', border: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Submission Deadline</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{new Date(hackathon.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={hackathon.external_link} target="_blank" rel="noopener noreferrer" className="btn-premium" style={{ height: '60px', padding: '0 32px', borderRadius: '18px', fontSize: '1.1rem' }}>
              Official Registration <ExternalLink size={20} />
            </a>
            <Link to="/create-project" className="btn-secondary" style={{ height: '60px', padding: '0 32px', borderRadius: '18px', fontSize: '1.1rem', fontWeight: 800 }}>
               Link New Project
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '8px' }}>Active Deployments</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>{hackathon.projects?.length || 0} teams currently operational in this sector.</p>
        </div>
      </div>

      {(!hackathon.projects || hackathon.projects.length === 0) ? (
        <div style={{ padding: '80px', background: 'var(--bg-card)', textAlign: 'center', borderRadius: '32px', border: '1px dashed var(--border-muted)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>No signals detected in this range yet. Be the first to deploy.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
          {hackathon.projects.map(p => (
            <Link to={`/project/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div className="card-premium" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '32px', borderRadius: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                   <div style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      {p.status}
                   </div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Users size={16} /> {p.team_size} needed
                   </div>
                </div>
                
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginBottom: '16px', lineHeight: 1.2 }}>{p.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '24px' }}>
                  {p.description}
                </p>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', borderTop: '1px solid var(--border-muted)', paddingTop: '20px' }}>
                  {p.skills && p.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>#{skill}</span>
                  ))}
                  {p.skills && p.skills.length > 3 && <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800 }}>+{p.skills.length - 3}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
