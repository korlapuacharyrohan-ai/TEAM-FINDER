import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchData } from '../api';
import { Clock, Users, Briefcase, ChevronLeft } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchData('projects'); // API doesn't have /id yet, filter locally
        const found = data.find(p => p.id === id);
        if (!found) throw new Error('Project not found');
        setProject(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>Loading project boundaries...</div>;
  if (error) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#ff4444', margin: '2rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 2rem' }}>
      <Link to="/find-team" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#aaa', textDecoration: 'none', marginBottom: '24px', fontSize: '0.95rem', transition: 'color 0.2s', ':hover': { color: 'white' } }}>
        <ChevronLeft size={16} /> Back to Projects
      </Link>
      
      <div style={{ background: '#0a0a0a', padding: '3.5rem', borderRadius: '24px', border: '1px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', flex: 1 }}>{project.title}</h1>
          <span style={{ padding: '8px 16px', background: 'rgba(255,122,24,0.1)', color: '#ff7a18', borderRadius: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
            {project.status}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '40px', padding: '20px', background: '#111', borderRadius: '12px', border: '1px solid #222' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontWeight: 500 }}><Briefcase size={18} color="#ff7a18" /> {project.category}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontWeight: 500 }}><Users size={18} color="#ff7a18" /> {project.team_size} players required</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontWeight: 500 }}><Clock size={18} color="#ff7a18" /> {project.duration}</span>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '20px' }}>Description</h3>
        <p style={{ lineHeight: '1.8', color: '#aaa', fontSize: '1.05rem', marginBottom: '40px', whiteSpace: 'pre-wrap' }}>{project.description}</p>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '20px' }}>Required Skills</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {project.skills.map((skill, i) => (
            <span key={i} style={{ background: '#222', padding: '8px 16px', borderRadius: '24px', fontSize: '0.95rem', color: '#fff', border: '1px solid #333', fontWeight: 500 }}>{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
