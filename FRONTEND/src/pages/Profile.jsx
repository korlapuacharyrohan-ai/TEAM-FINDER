import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, updateUserProfile, getMatchScore, updateUserSkills } from '../api';
import { useAuth } from '../context/AuthContext';
import SkillSelector from '../components/SkillSelector';

export default function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [matchData, setMatchData] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?.id;
  const isOwner = currentUserId === userId;

  useEffect(() => {
    loadProfile();
    if (userId && currentUserId && userId !== currentUserId) {
      loadMatchScore();
    }
  }, [userId, currentUserId]);

  const loadMatchScore = async () => {
    try {
      const data = await getMatchScore(userId);
      setMatchData(data);
    } catch (err) {
      console.error('Failed to load match score:', err);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserProfile(userId);
      setProfile(data);
      setEditData({
        avatar_url: data.avatar_url || '',
        bio: data.bio || '',
        github_url: data.github_url || '',
        linkedin_url: data.linkedin_url || '',
        portfolio_url: data.portfolio_url || '',
        skills: data.skills || [],
        availability: data.availability || 'Available'
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      
      // Update profile details
      await updateUserProfile(editData);
      
      // Atomic skill update if changed
      if (editData.skills) {
        await updateUserSkills(editData.skills);
      }

      setIsEditing(false);
      loadProfile(); // reload to get updated data
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading profile...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444' }}>{error}</div>;
  if (!profile) return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>User not found</div>;

  return (
    <div className="container" style={{ padding: 'var(--space-xxl) var(--space-md)' }}>
      {/* Profile Header / Main Info */}
      <div className="glass" style={{ padding: '60px', borderRadius: '40px', border: '1px solid var(--border-muted)', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative Background Accent */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)', opacity: 0.3, zIndex: -1 }}></div>

        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '24px' }}>Edit Operational Identity</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avatar URL</label>
                <input 
                  type="url" name="avatar_url" 
                  style={{ width: '100%', padding: '16px 20px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none' }} 
                  value={editData.avatar_url} onChange={handleEditChange} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Availability Status</label>
                <select 
                  name="availability" value={editData.availability} onChange={handleEditChange}
                  style={{ width: '100%', padding: '16px 20px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', outline: 'none' }}
                >
                  <option value="Available">Fully Operational</option>
                  <option value="Busy">Limited Bandwidth</option>
                  <option value="Not Looking">Offline / Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Professional Mission Brief (Bio)</label>
              <textarea 
                name="bio" maxLength={300} 
                style={{ width: '100%', padding: '20px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px', minHeight: '120px', resize: 'vertical', lineHeight: 1.6 }} 
                value={editData.bio} onChange={handleEditChange} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Technical Stack</label>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-muted)' }}>
                <SkillSelector 
                  selectedSkills={editData.skills} 
                  onChange={(skills) => setEditData({ ...editData, skills })} 
                  maxSelections={10} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>GitHub Registry</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <input type="url" name="github_url" style={{ flex: 1, padding: '16px 20px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px' }} value={editData.github_url} onChange={handleEditChange} />
                   {!profile.github_id && (
                     <button type="button" onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE}/auth/github`} style={{ background: '#24292e', color: 'white', padding: '0 24px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700, border: 'none' }}>
                        Connect
                     </button>
                   )}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Portfolio Terminal</label>
                <input type="url" name="portfolio_url" style={{ width: '100%', padding: '16px 20px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '18px' }} value={editData.portfolio_url} onChange={handleEditChange} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button type="submit" disabled={saving} className="btn-premium" style={{ height: '56px', padding: '0 32px', borderRadius: '16px' }}>
                {saving ? 'UPDATING...' : 'SAVE OPERATIONAL DATA'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ height: '56px', padding: '0 32px', borderRadius: '16px' }}>
                CANCEL
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ width: '160px', height: '160px', borderRadius: '48px', background: 'var(--bg-darker)', border: '2px solid var(--primary)', overflow: 'hidden', padding: '12px' }}>
                   <div style={{ width: '100%', height: '100%', borderRadius: '36px', overflow: 'hidden', background: 'var(--bg-card)' }}>
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '3rem', fontWeight: 900 }}>
                          {profile.name.charAt(0)}
                        </div>
                      )}
                   </div>
                </div>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{profile.name}</h1>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: profile.availability === 'Available' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', padding: '8px 20px', borderRadius: '14px', border: '1px solid var(--border-muted)' }}>
                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: profile.availability === 'Available' ? '#10b981' : '#888' }}></div>
                         <span style={{ fontSize: '0.85rem', fontWeight: 800, color: profile.availability === 'Available' ? '#10b981' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {profile.availability || 'Online'}
                         </span>
                      </div>
                   </div>
                   <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Active operative since {new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {isOwner && (
                <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ height: '52px', padding: '0 28px', borderRadius: '14px', fontWeight: 800 }}>
                  UPDATE PROFILE
                </button>
              )}
            </div>

            {profile.bio && (
              <div style={{ maxWidth: '800px' }}>
                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mission Profile</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.7, fontWeight: 500 }}>{profile.bio}</p>
              </div>
            )}

            {matchData && (
              <div className="card-premium" style={{ border: '1px solid var(--border-muted)', background: 'rgba(255,122,24,0.03)', padding: '40px', borderRadius: '32px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Synapse Analysis</h4>
                      <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>Compatibility Score</h2>
                    </div>
                    <div style={{ background: 'var(--bg-darker)', width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--primary-soft)' }}>
                       <span style={{ fontSize: '1.75rem', fontWeight: 950, color: 'white' }}>{matchData.score}%</span>
                    </div>
                 </div>
                 
                 {matchData.bullets && (
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                     {matchData.bullets.map((bullet, idx) => (
                       <div key={idx} className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: idx === 2 ? '#ff4444' : '#10b981', marginTop: '6px', flexShrink: 0 }}></div>
                          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{bullet}</p>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Technical Inventory</h3>
               <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {profile.skills && profile.skills.map((skill, i) => (
                    <span key={i} style={{ padding: '10px 20px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '14px', fontSize: '0.95rem', fontWeight: 800, border: '1px solid rgba(255,122,24,0.1)' }}>
                      {skill}
                    </span>
                  ))}
               </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', borderTop: '1px solid var(--border-muted)', paddingTop: '40px' }}>
               {profile.github_url && (
                 <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800 }}>
                   SOURCE CODE [GITHUB]
                 </a>
               )}
               {profile.portfolio_url && (
                 <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800 }}>
                   EXTERNAL TERMINAL [PORTFOLIO]
                 </a>
               )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '60px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '32px' }}>Operational Catalog</h2>
        {(!profile.projects || profile.projects.length === 0) ? (
          <div style={{ background: 'var(--bg-card)', padding: '60px', borderRadius: '32px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-muted)', fontWeight: 600 }}>
            Zero initiatives currently found in this operatives history.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
            {profile.projects.map(project => (
              <div key={project.id} className="card-premium" style={{ display: 'flex', flexDirection: 'column', padding: '32px', borderRadius: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ background: project.role === 'Creator' ? 'var(--primary-soft)' : '#1a1a1a', color: project.role === 'Creator' ? 'var(--primary)' : 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                     {project.role}
                  </div>
                </div>
                <Link to={`/project/${project.id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px', lineHeight: 1.2 }}>{project.title}</h3>
                </Link>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-muted)', paddingTop: '20px' }}>
                  {project.skills && project.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>#{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
