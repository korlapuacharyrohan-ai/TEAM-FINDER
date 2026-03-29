import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHackathons } from '../api';
import { Trophy, Calendar, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getHackathons();
        setHackathons(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--space-xxl) var(--space-md)' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px', position: 'relative' }}>
        {/* Background Accent */}
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', opacity: 0.3, zIndex: -1 }}></div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '10px 24px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', border: '1px solid rgba(16,185,129,0.1)' }}>
          <Trophy size={18} /> Global Arenas
        </div>
        <h1 className="text-gradient" style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '24px' }}>
          Hackathons
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
          The epicentre of rapid prototyping. Select an arena, assemble your squad, and build the future of the decentralized web.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '100px 0' }}>
            <div className="loader"></div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>SCANNING NETWORK FOR EVENTS...</div>
        </div>
      ) : error ? (
        <div style={{ padding: '40px', background: 'rgba(255,68,68,0.08)', color: '#ff4444', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,68,68,0.2)', fontWeight: 600 }}>{error}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '40px' }}>
          {hackathons.map(h => (
            <div key={h.id} className="card-premium" style={{ borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-muted)', padding: 0 }}>
              <div style={{ padding: '40px 40px 24px 40px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 900, margin: '0 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{h.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.1)', textTransform: 'uppercase' }}>
                    <Trophy size={14} /> {h.prize}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800, background: 'var(--primary-soft)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,122,24,0.1)', textTransform: 'uppercase' }}>
                    <Calendar size={14} /> {new Date(h.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, flexGrow: 1, marginBottom: '28px', fontSize: '1.05rem', fontWeight: 500 }}>
                  {h.description}
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {h.theme_tags && h.theme_tags.map((tag, i) => (
                    <span key={i} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>#{tag}</span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-muted)' }}>
                <Link to={`/hackathon/${h.id}`} style={{ flex: 1, padding: '24px', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 800, fontSize: '0.95rem', borderRight: '1px solid var(--border-muted)' }}>
                  View All Projects <ChevronRight size={18} />
                </Link>
                <a href={h.external_link} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '24px', background: 'var(--primary)', color: 'black', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 900, fontSize: '0.95rem' }}>
                  Apply Now <ExternalLink size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
