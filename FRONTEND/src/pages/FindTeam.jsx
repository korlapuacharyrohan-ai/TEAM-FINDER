import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchData } from '../api';

export default function FindTeam() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchData('projects');
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (loading) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>Loading discoverable projects...</div>;
  if (error) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#ff4444', background: 'rgba(255,0,0,0.1)', margin: '2rem', borderRadius: '8px' }}>{error}</div>;

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Find a Team</h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Discover open projects looking for collaborators across the globe.</p>
      </div>

      {projects.length === 0 ? (
        <div style={{ background: '#111', border: '1px dashed #333', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' }}>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>No active projects</h3>
          <p style={{ color: '#888' }}>There are currently no projects looking for members. Be the first to start one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {projects.map(p => (
            <Link to={`/project/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '16px', border: '1px solid #222', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', ':hover': { borderColor: '#444', transform: 'translateY(-4px)' } }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,122,24,0.1)', color: '#ff7a18', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {p.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '12px', lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: '0.85rem', paddingTop: '16px', borderTop: '1px solid #222' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#ccc' }}>{p.team_size} needed</span>
                  </div>
                  <span>{p.duration}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
