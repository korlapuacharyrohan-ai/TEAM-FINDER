import { getProject, getProjectMembers, endorseUser, applyToProject, getProjectRequests, respondToProjectRequest, getTeammateSuggestions, deleteProject, updateProjectSettings, requestToJoinProject } from '../api';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Clock, Users, Briefcase, ChevronLeft, ExternalLink, Github, Settings, Image as ImageIcon, Medal, CheckCircle, Star, Zap, Trash2, X, MessageSquare, Rocket } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?.id;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [roleInput, setRoleInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  
  const [showEditSettings, setShowEditSettings] = useState(false);
  const [editForm, setEditForm] = useState({ thumbnail_url: '', demo_url: '', repo_url: '', hackathon_result: '', is_completed: false });
  const [updateError, setUpdateError] = useState('');

  const [projectMembers, setProjectMembers] = useState([]);
  const [endorsingUserId, setEndorsingUserId] = useState(null);
  const [endorseSkill, setEndorseSkill] = useState('');
  const [endorseError, setEndorseError] = useState('');
  const [endorseSuccessMsg, setEndorseSuccessMsg] = useState('');
  
  // New Feature States
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests'
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const found = await getProject(id);
        if (!found) throw new Error('Project not found');
        setProject(found);
        setEditForm({
          thumbnail_url: found.thumbnail_url || '',
          demo_url: found.demo_url || '',
          repo_url: found.repo_url || '',
          hackathon_result: found.hackathon_result || '',
          is_completed: found.is_completed || false
        });
        
        const membersData = await getProjectMembers(found.id);
        setProjectMembers(Array.isArray(membersData) ? membersData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (project && project.created_by === currentUserId && activeTab === 'requests') {
      loadRequests();
    }
  }, [project, activeTab, currentUserId]);

  const loadRequests = async () => {
    try {
      const data = await getProjectRequests(id);
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      setShowSuggestions(true);
      const data = await getTeammateSuggestions(id);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApply = async () => {
    if (!messageInput.trim()) {
      setJoinError('Please enter a message to the owner.');
      return;
    }
    try {
      setJoinError('');
      await applyToProject(id, messageInput.trim());
      setJoinSuccess(true);
      setShowJoinPrompt(false);
    } catch (err) {
      setJoinError(err.message);
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      await respondToProjectRequest(requestId, status);
      // Reload requests and members
      loadRequests();
      const membersData = await getProjectMembers(id);
      setProjectMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err) {
      alert('Failed to respond to request: ' + err.message);
    }
  };

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(id);
      window.location.href = '/explore';
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
      setIsDeleting(false);
    }
  };

  const handleJoin = async () => {
    if (!roleInput.trim()) {
      setJoinError('Please enter a role.');
      return;
    }
    if (!messageInput.trim()) {
      setJoinError('Please enter a short message to the owner.');
      return;
    }
    try {
      setJoinError('');
      await requestToJoinProject(project.id, roleInput, messageInput);
      setJoinSuccess(true);
      setShowJoinPrompt(false);
    } catch (err) {
      setJoinError(err.message);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      setUpdateError('');
      const updated = await updateProjectSettings(project.id, editForm);
      setProject({ ...project, ...updated }); // update local view
      setShowEditSettings(false);
    } catch (err) {
      setUpdateError(err.message);
    }
  };

  const handleEndorse = async (targetUserId) => {
    if (!endorseSkill.trim()) {
      setEndorseError('Please enter a skill to endorse');
      return;
    }
    try {
      setEndorseError('');
      setEndorseSuccessMsg('');
      await endorseUser(project.id, targetUserId, endorseSkill.trim());
      setEndorseSuccessMsg('Endorsement submitted successfully!');
      setEndorsingUserId(null);
      setEndorseSkill('');
    } catch (err) {
      setEndorseError(err.message);
    }
  };

  const isMember = projectMembers.some(m => m.id === currentUserId);

  if (loading) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>Loading project boundaries...</div>;
  if (error) return <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#ff4444', margin: '2rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>;
  if (!project) return null;

  return (
    <div className="container" style={{ padding: 'var(--space-xxl) var(--space-md)' }}>
      <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '32px', fontSize: '0.95rem', transition: 'color 0.2s' }}>
        <ChevronLeft size={18} /> Back to discovery
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '40px', alignItems: 'start' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Project Hero / Cover */}
          <div className="glass" style={{ borderRadius: '28px', padding: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '20px', overflow: 'hidden' }}>
              <img 
                src={project.thumbnail_url || `https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200`} 
                alt={project.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                 <span style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', color: project.is_completed ? '#10b981' : 'var(--primary)', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {project.is_completed ? 'Completed' : project.status}
                </span>
              </div>
            </div>
          </div>

          {/* Title & Description Segment */}
          <div className="card-premium" style={{ borderRadius: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '20px' }}>
               <div>
                  <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '16px' }}>{project.title}</h1>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} /> {project.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {project.duration}</span>
                  </div>
               </div>
               {isAuthenticated && project.created_by === currentUserId && (
                 <button onClick={() => setShowEditSettings(!showEditSettings)} className="btn-secondary" style={{ padding: '10px 16px', borderRadius: '12px' }}>
                   <Settings size={18} /> Edit
                 </button>
               )}
            </div>

            {project.hackathon_result && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.2)', padding: '12px 24px', borderRadius: '16px', marginBottom: '32px', fontWeight: 800, fontSize: '1rem' }}>
                <Medal size={22} /> {project.hackathon_result}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>The Project</h3>
              <p style={{ lineHeight: '1.8', color: 'var(--text-muted)', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{project.description}</p>
            </div>
          </div>

          {/* Members / Teammates Card */}
          <div className="card-premium" style={{ borderRadius: '28px' }}>
             <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={22} color="var(--primary)" /> Founding Team ({projectMembers.length})
             </h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {projectMembers.map(m => (
                  <div key={m.id} className="glass" style={{ padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-muted)' }}>
                    <img 
                      src={m.avatar_url || `https://ui-avatars.com/api/?name=${m.name}&background=333&color=fff`} 
                      style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--border-muted)' }} 
                    />
                    <div>
                      <h4 style={{ color: 'white', margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 700 }}>{m.name}</h4>
                      <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{m.role}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Required Skills Segment */}
          <div className="card-premium" style={{ borderRadius: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '20px' }}>Stack Requirements</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {project.skills && project.skills.length > 0 ? (
                project.skills.map((skill, i) => (
                  <span key={i} style={{ background: 'var(--primary-soft)', padding: '10px 20px', borderRadius: '12px', fontSize: '0.95rem', color: 'var(--primary)', border: '1px solid rgba(255,122,24,0.1)', fontWeight: 700 }}>{skill}</span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Open stack. Any skill welcome.</span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Sticky Area */}
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
           {/* Action Card */}
           <div className="glass" style={{ padding: '28px', borderRadius: '28px' }}>
              <div style={{ marginBottom: '24px' }}>
                 <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Team Capacity</div>
                 <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>{project.team_size} slots open</div>
              </div>

              {isAuthenticated && project.created_by !== currentUserId && !isMember && !joinSuccess && (
                <button 
                  onClick={() => setShowJoinPrompt(true)} 
                  className="btn-premium" 
                  style={{ width: '100%', justifyContent: 'center', height: '54px', borderRadius: '16px', fontSize: '1rem' }}
                >
                  <Rocket size={20} /> Deploy Skills
                </button>
              )}

              {isMember && (
                 <div style={{ padding: '16px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 700, textAlign: 'center' }}>
                    <CheckCircle size={18} style={{ marginBottom: '4px' }} /> Member Level
                 </div>
              )}

              {joinSuccess && (
                 <div style={{ padding: '16px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '16px', border: '1px solid rgba(255,122,24,0.2)', fontWeight: 700, textAlign: 'center' }}>
                    Application Pending
                 </div>
              )}

              {isAuthenticated && project.created_by === currentUserId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={loadSuggestions} 
                    className="btn-premium" 
                    style={{ width: '100%', justifyContent: 'center', height: '54px', borderRadius: '16px' }}
                  >
                    <Zap size={20} /> Scan Talent
                  </button>
                  {requests.length > 0 && (
                    <button 
                      onClick={() => setActiveTab('requests')} 
                      className="btn-secondary" 
                      style={{ width: '100%', justifyContent: 'center', height: '54px', borderRadius: '16px' }}
                    >
                      Applicants ({requests.length})
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ flex: 1, padding: '10px', minWidth: 'auto' }} title="Demo">
                    <ExternalLink size={18} />
                  </a>
                )}
                {project.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ flex: 1, padding: '10px', minWidth: 'auto' }} title="Repo">
                    <Github size={18} />
                  </a>
                )}
              </div>
           </div>

           {/* Owner Profile Small Card */}
           <div className="card-premium" style={{ borderRadius: '24px', padding: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px' }}>Lead Architect</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img 
                  src={`https://ui-avatars.com/api/?name=${project.owner_name || 'Owner'}&background=ff7a18&color=000`} 
                  style={{ width: '48px', height: '48px', borderRadius: '14px' }} 
                />
                <div>
                   <Link to={`/profile/${project.created_by}`} style={{ color: 'white', fontWeight: 800, textDecoration: 'none' }}>{project.owner_name || 'Project Lead'}</Link>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Owner</div>
                </div>
              </div>
           </div>

           {isAuthenticated && project.created_by === currentUserId && (
             <button 
               onClick={() => setShowDeleteConfirm(true)} 
               style={{ background: 'transparent', border: '1px solid rgba(255,0,0,0.2)', color: '#ff4444', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
             >
               Delete Initiative
             </button>
           )}
        </div>
      </div>

      {/* Overlays / Modals */}
      {showSuggestions && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="card-premium" style={{ width: '100%', maxWidth: '600px', padding: 0, borderRadius: '32px', overflow: 'hidden' }}>
            <div style={{ padding: '28px', borderBottom: '1px solid var(--border-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
              <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: 900 }}><Zap color="var(--primary)" size={24} /> AI Talent Match</h3>
              <button 
                onClick={() => setShowSuggestions(false)} 
                style={{ background: 'var(--bg-darker)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '28px', maxHeight: '500px', overflowY: 'auto' }}>
              {loadingSuggestions ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="loader" style={{ margin: '0 auto 24px' }}></div>
                  <div style={{ fontWeight: 700, color: 'white' }}>Analyzing Candidate Matrix...</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Parsing skill overlap and contributor history</div>
                </div>
              ) : suggestions.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>No high-probability matches identified in the current pool.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {suggestions.map(candidate => (
                    <div key={candidate.userId} className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img 
                            src={candidate.avatar_url || `https://ui-avatars.com/api/?name=${candidate.name}&background=ff7a18&color=000`} 
                            style={{ width: '56px', height: '56px', borderRadius: '16px', border: '2px solid var(--primary)' }} 
                          />
                          <div>
                            <h4 style={{ margin: 0, color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{candidate.name}</h4>
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{candidate.availability || 'Available'}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', background: 'var(--primary-soft)', padding: '10px 16px', borderRadius: '14px', border: '1px solid rgba(255,122,24,0.1)' }}>
                          <div style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}>{candidate.overlapCount}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginTop: '2px' }}>Skill Score</div>
                        </div>
                      </div>
                      
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '16px', marginBottom: '20px', borderLeft: '4px solid var(--primary)' }}>
                        <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>
                          "{candidate.reason}"
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {candidate.matchedSkills.slice(0, 3).map(s => (
                            <span key={s} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{s}</span>
                          ))}
                        </div>
                        <Link to={`/profile/${candidate.userId}`} className="btn-premium" style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem' }}>View Assets</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px' }}>
           <div className="card-premium" style={{ maxWidth: '480px', textAlign: 'center', padding: '40px', borderRadius: '32px' }}>
              <div style={{ color: '#ff4444', marginBottom: '24px' }}><Trash2 size={64} style={{ margin: '0 auto' }} /></div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '16px', color: 'white' }}>Confirm Archive?</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
                Initiating permanent deletion of <strong>{project.title}</strong>. This process is irreversible and all repository metadata will be purged.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                 <button 
                  disabled={isDeleting} 
                  onClick={handleDeleteProject} 
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#ff4444', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                 >
                   {isDeleting ? 'Purging...' : 'Delete Permanently'}
                 </button>
                 <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="btn-secondary" 
                  style={{ flex: 1, borderRadius: '16px' }}
                 >
                   Keep Project
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Join Application Modal */}
      {showJoinPrompt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="card-premium" style={{ width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '12px', color: 'white' }}>Pitch Your Skills</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>The owner will receive your profile and match score along with this message.</p>
            
            <div style={{ marginBottom: '24px' }}>
              <textarea 
                placeholder="Briefly explain your technical fit and why you're interested..." 
                value={messageInput} 
                onChange={(e) => setMessageInput(e.target.value)} 
                style={{ width: '100%', padding: '20px', minHeight: '160px', background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', color: 'white', borderRadius: '16px', outline: 'none', resize: 'none', fontSize: '1rem', lineHeight: 1.5 }} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={handleApply} className="btn-premium" style={{ flex: 1, height: '54px', borderRadius: '16px' }}>Submit Intel</button>
              <button onClick={() => setShowJoinPrompt(false)} className="btn-secondary" style={{ flex: 1, borderRadius: '16px' }}>Cancel</button>
            </div>
            {joinError && <div style={{ color: '#ff4444', marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{joinError}</div>}
          </div>
        </div>
      )}

      {/* Side-loading active tab contents (Requests) */}
      {activeTab === 'requests' && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="card-premium" style={{ width: '100%', maxWidth: '650px', padding: 0, borderRadius: '32px', overflow: 'hidden' }}>
            <div style={{ padding: '28px', borderBottom: '1px solid var(--border-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
              <h3 style={{ margin: 0, color: 'white', fontWeight: 900, fontSize: '1.4rem' }}>Incubation Requests</h3>
              <button 
                onClick={() => setActiveTab('overview')} 
                style={{ background: 'var(--bg-darker)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '10px', borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '28px', maxHeight: '550px', overflowY: 'auto' }}>
              {requests.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Zero active signal applications.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {requests.map(req => (
                    <div key={req.id} className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img src={req.avatar_url || `https://ui-avatars.com/api/?name=${req.user_name}&background=ff7a18&color=000`} style={{ width: '52px', height: '52px', borderRadius: '14px' }} />
                          <div>
                            <Link to={`/profile/${req.user_id}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem' }}>{req.user_name}</Link>
                            <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{req.availability}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleRespond(req.id, 'accepted')} style={{ padding: '10px 20px', background: '#10b981', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Recruit</button>
                          <button onClick={() => handleRespond(req.id, 'rejected')} style={{ padding: '10px 20px', background: 'transparent', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                        </div>
                      </div>
                      {req.message && (
                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px', borderLeft: '4px solid var(--primary)' }}>
                          "{req.message}"
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {req.user_skills?.map(s => <span key={s} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{s}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
