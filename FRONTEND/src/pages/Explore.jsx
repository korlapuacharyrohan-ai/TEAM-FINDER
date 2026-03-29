import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProjects, getUsers } from '../api';
import SkillSelector from '../components/SkillSelector';
import { Search, Loader2, Users } from 'lucide-react';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [activeTab, setActiveTab] = useState('projects');
  
  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectFilters, setProjectFilters] = useState({
    skills: [],
    team_size: '',
    status: ''
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({
    skills: [],
    availability: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'projects') loadProjects();
    else loadUsers();
  }, [activeTab, q, projectFilters, userFilters]);

  async function loadProjects() {
    try {
      setProjectLoading(true);
      setError('');
      const data = await getProjects({ 
        search: q,
        team_size: projectFilters.team_size,
        status: projectFilters.status,
        skills: projectFilters.skills.join(',')
      });
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setProjectLoading(false);
    }
  }

  async function loadUsers() {
    try {
      setUserLoading(true);
      setError('');
      const data = await getUsers({
        search: q,
        availability: userFilters.availability,
        skills: userFilters.skills.join(',')
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setUserLoading(false);
    }
  }

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) setSearchParams({ q: val });
    else setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: 'var(--space-xxl) var(--space-md)' }}>
      <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.25rem' }}>Explore</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', fontWeight: 500 }}>Discover open projects and top-tier technical talent.</p>
        </div>
        
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '480px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search titles, skills, or bios..." 
            value={q}
            onChange={handleSearchChange}
            style={{ width: '100%', padding: '14px 20px 14px 48px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-muted)', color: 'white', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s shadow 0.2s' }}
          />
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-xl)', paddingBottom: '16px', borderBottom: '1px solid var(--border-muted)' }}>
        <button 
          onClick={() => setActiveTab('projects')}
          className={activeTab === 'projects' ? 'btn-premium' : 'btn-secondary'}
          style={{ padding: '10px 24px', borderRadius: '10px', minWidth: 'auto' }}
        >
          Projects {activeTab === 'projects' && `(${projects.length})`}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-premium' : 'btn-secondary'}
          style={{ padding: '10px 24px', borderRadius: '10px', minWidth: 'auto' }}
        >
          Talent {activeTab === 'users' && `(${users.length})`}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar Filters */}
        <div className="glass" style={{ width: '100%', maxWidth: '300px', flexShrink: 0, padding: '28px', borderRadius: '20px' }}>
          <h3 style={{ color: 'white', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 700 }}>Filters</h3>
          
          {activeTab === 'projects' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                <select 
                  value={projectFilters.status} 
                  onChange={(e) => setProjectFilters({...projectFilters, status: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '10px', outline: 'none' }}
                >
                  <option value="">Any Status</option>
                  <option value="Seeking Team">Seeking Team</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Team Size</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="Any size"
                  value={projectFilters.team_size} 
                  onChange={(e) => setProjectFilters({...projectFilters, team_size: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '10px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Skills</label>
                <SkillSelector 
                  selectedSkills={projectFilters.skills}
                  onChange={(skills) => setProjectFilters({...projectFilters, skills})}
                  maxSelections={5}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Availability</label>
                <select 
                  value={userFilters.availability} 
                  onChange={(e) => setUserFilters({...userFilters, availability: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '10px', outline: 'none' }}
                >
                  <option value="">Any Availability</option>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Not Looking">Not Looking</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</label>
                <SkillSelector 
                  selectedSkills={userFilters.skills}
                  onChange={(skills) => setUserFilters({...userFilters, skills})}
                  maxSelections={5}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {error && <div style={{ padding: '16px', background: 'rgba(255,0,0,0.1)', color: '#ff4444', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,0,0,0.2)' }}>{error}</div>}
          
          {activeTab === 'projects' && (
            projectLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
                <div className="loader" style={{ marginBottom: '20px' }}></div>
                Indexing repositories...
              </div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem', background: 'var(--bg-card)', borderRadius: '24px', color: 'var(--text-muted)', border: '1px dashed var(--border-muted)' }}>
                No active projects found matching your stack.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {projects.map(p => (
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
                        {p.hackathon_result && (
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(218,165,32,0.1)', color: '#ffd700', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                             🏆 {p.hackathon_result}
                           </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '12px', lineHeight: 1.25 }}>{p.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {p.skills && p.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(255,122,24,0.1)', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                        {p.skills && p.skills.length > 3 && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, padding: '4px' }}>+{p.skills.length - 3}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', paddingTop: '20px', borderTop: '1px solid var(--border-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <Users size={16} />
                          <span>{p.team_size} needed</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>{p.duration}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {activeTab === 'users' && (
            userLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
                <div className="loader" style={{ marginBottom: '20px' }}></div>
                Scanning user matrix...
              </div>
            ) : users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem', background: 'var(--bg-card)', borderRadius: '24px', color: 'var(--text-muted)', border: '1px dashed var(--border-muted)' }}>
                No creators found matching your query.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {users.map(u => (
                  <Link to={`/profile/${u.id}`} key={u.id} style={{ textDecoration: 'none' }}>
                    <div className="card-premium" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
                         <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--primary)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-darker)' }}>
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '1.6rem', fontWeight: 800 }}>{u.name.charAt(0).toUpperCase()}</span>
                            )}
                         </div>
                         <div>
                           <h3 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800 }}>{u.name}</h3>
                           <span style={{ 
                               fontSize: '0.7rem', 
                               padding: '3px 10px', 
                               borderRadius: '6px',
                               background: u.availability === 'Available' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                               color: u.availability === 'Available' ? '#10b981' : 'var(--text-muted)',
                               border: `1px solid ${u.availability === 'Available' ? 'rgba(16,185,129,0.2)' : 'var(--border-muted)'}`,
                               fontWeight: 800,
                               textTransform: 'uppercase',
                               letterSpacing: '0.05em'
                             }}>
                               {u.availability}
                             </span>
                         </div>
                      </div>
                      
                      {u.bio && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {u.bio}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-muted)' }}>
                        {u.skills && u.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', border: '1px solid rgba(255,122,24,0.1)', fontWeight: 600 }}>
                            {skill}
                          </span>
                        ))}
                        {u.skills && u.skills.length > 3 && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, padding: '4px' }}>+{u.skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
