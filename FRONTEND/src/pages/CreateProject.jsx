import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, getHackathons } from '../api';
import SkillSelector from '../components/SkillSelector';

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [hackathons, setHackathons] = useState([]);

  useEffect(() => {
    getHackathons().then(setHackathons).catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web',
    status: 'Seeking Team',
    team_size: '2',
    duration: '1-3 months',
    work_style: 'async',
    skills: [],
    demo_url: '',
    repo_url: '',
    hackathon_id: ''
  });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.skills.length === 0) {
      setError('Please select at least one required skill');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      team_size: parseInt(formData.team_size)
    };

    try {
      const res = await createProject(payload);
      navigate(`/project/${res.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-xxl) var(--space-md)' }}>
      <div className="glass" style={{ maxWidth: '900px', margin: '0 auto', padding: '60px', borderRadius: '40px', border: '1px solid var(--border-muted)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.04em' }}>Launch Initiative</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>Define your mission parameters and scout for the world's most capable contributors.</p>
        </div>

        {error && (
          <div style={{ color: '#ff4444', marginBottom: '32px', padding: '20px', background: 'rgba(255,68,68,0.08)', borderRadius: '16px', border: '1px solid rgba(255,68,68,0.2)', fontSize: '1rem', fontWeight: 600, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project Title</label>
            <input 
              name="title" 
              placeholder="e.g. Project Orion: Decentralized Compute"
              value={formData.title} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '18px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1.1rem', transition: 'border-color 0.2s' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mission Briefing</label>
            <textarea 
              name="description" 
              placeholder="Describe the scope, objectives, and technical challenges of your initiative..."
              value={formData.description} 
              onChange={handleChange} 
              required 
              rows={8} 
              style={{ width: '100%', padding: '20px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1.05rem', transition: 'border-color 0.2s', resize: 'vertical', lineHeight: 1.6 }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '18px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1rem', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App</option>
                <option value="game">Game Development</option>
                <option value="ai">AI / Machine Learning</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Squad Size</label>
              <input 
                type="number" 
                name="team_size" 
                min="1" 
                max="20" 
                value={formData.team_size} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '18px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1rem' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core Skillsets Required</label>
            <div className="glass" style={{ padding: '24px', borderRadius: '18px', border: '1px solid var(--border-muted)' }}>
              <SkillSelector 
                selectedSkills={formData.skills} 
                onChange={(skills) => setFormData({ ...formData, skills })} 
                maxSelections={10} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Duration</label>
              <select 
                name="duration" 
                value={formData.duration} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '18px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1rem' }}
              >
                <option value="hackathon">Weekend Hackathon</option>
                <option value="1-3 months">1-3 Months</option>
                <option value="3-6 months">3-6 Months</option>
                <option value="ongoing">Ongoing engagement</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operational Style</label>
              <select 
                name="work_style" 
                value={formData.work_style} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '18px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1rem' }}
              >
                <option value="async">Async / Full Autonomy</option>
                <option value="sync">Sync / Scheduled Sprints</option>
                <option value="hybrid">Hybrid Collaboration</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Arena Alignment (Optional)</label>
            <select 
              name="hackathon_id" 
              value={formData.hackathon_id} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '18px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1rem' }}
            >
              <option value="">None / Independent Operation</option>
              {hackathons.map(h => (
                <option key={h.id} value={h.id}>{h.name} (Closes: {new Date(h.deadline).toLocaleDateString()})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Demo Interface (Optional)</label>
              <input type="url" name="demo_url" value={formData.demo_url} onChange={handleChange} placeholder="https://app.nexus.io" style={{ width: '100%', padding: '18px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Source Registry (Optional)</label>
              <input type="url" name="repo_url" value={formData.repo_url} onChange={handleChange} placeholder="https://github.com/nexus/core" style={{ width: '100%', padding: '18px 24px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none', fontSize: '1rem' }} />
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <button type="submit" disabled={loading} className="btn-premium" style={{ width: '100%', justifyContent: 'center', height: '64px', borderRadius: '20px', fontSize: '1.2rem' }}>
              {loading ? 'TRANSMITTING MISSION DATA...' : 'LAUNCH INITIATIVE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
