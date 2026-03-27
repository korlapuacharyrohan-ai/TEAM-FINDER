import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../api';

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web',
    status: 'Seeking Team',
    team_size: '2',
    duration: '1-3 months',
    work_style: 'async',
    skills: ''
  });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      team_size: parseInt(formData.team_size),
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const res = await fetchData('projects', { method: 'POST', body: JSON.stringify(payload) });
      navigate(`/project/${res.project.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '2.5rem', background: '#0a0a0a', borderRadius: '16px', border: '1px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '24px', fontWeight: 800 }}>Create New Project</h1>
      {error && <div style={{ color: '#ff4444', marginBottom: '20px', padding: '12px', background: 'rgba(255,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(255,68,68,0.2)' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Project Title</label>
          <input name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px', transition: 'border-color 0.2s' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows={6} style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px', transition: 'border-color 0.2s', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile App</option>
              <option value="game">Game Development</option>
              <option value="ai">AI / Machine Learning</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Team Size Needed</label>
            <input type="number" name="team_size" min="1" max="20" value={formData.team_size} onChange={handleChange} required style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Required Skills (comma separated)</label>
          <input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, UI/UX..." required style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Duration</label>
            <select name="duration" value={formData.duration} onChange={handleChange} style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
              <option value="hackathon">Weekend Hackathon</option>
              <option value="1-3 months">1-3 Months</option>
              <option value="3-6 months">3-6 Months</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '0.9rem' }}>Work Style</label>
            <select name="work_style" value={formData.work_style} onChange={handleChange} style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '8px' }}>
              <option value="async">Async / Flexible</option>
              <option value="sync">Sync / Scheduled</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #ff7a18, #af002d)', color: 'white', padding: '16px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', marginTop: '20px', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating Project...' : 'Publish Project'}
        </button>
      </form>
    </div>
  );
}
