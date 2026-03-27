import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchData } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDash() {
      try {
        const res = await fetchData('dashboard');
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDash();
  }, []);

  if (loading) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>Loading Dashboard secure gateway...</div>;
  if (error) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#ff4444', margin: '2rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'linear-gradient(135deg, rgba(255,122,24,0.1), rgba(175,0,45,0.1))', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,122,24,0.2)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px', color: 'white' }}>Welcome back, <span style={{ color: '#ff7a18' }}>{data.user.name}</span></h1>
          <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Manage your active teams and discover new opportunities across the platform.</p>
        </div>
        <Link to="/create-project" style={{ background: 'white', color: 'black', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>+ New Project</Link>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '24px' }}>Your Discovered Projects</h2>
        {(!data.projects || data.projects.length === 0) ? (
          <div style={{ background: '#0a0a0a', padding: '4rem 2rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed #333' }}>
            <p style={{ color: '#888', fontSize: '1.1rem' }}>You haven't created any projects yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {data.projects.map(p => (
              <Link to={`/project/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '16px', border: '1px solid #222', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', ':hover': { borderColor: '#444', transform: 'translateY(-4px)' } }}>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,122,24,0.1)', color: '#ff7a18', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {p.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: '12px', lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.6, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
