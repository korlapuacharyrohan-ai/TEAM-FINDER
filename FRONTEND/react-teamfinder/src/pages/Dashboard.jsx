import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { getDashboard } from '../services/api.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboard();
        setStats(data.stats);
        setProjects(data.projects || []);
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { id: 'all', label: 'All Projects' },
    { id: 'mine', label: 'My Projects' },
    { id: 'recruiting', label: 'Recruiting' },
  ];

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'mine') return project.ownerId === user?.id;
    if (activeTab === 'recruiting') return project.status === 'recruiting';
    return true;
  });

  if (loading) return <div className="page-wrap"><div className="container py-20 text-center">Loading dashboard...</div></div>;
  if (error) return <div className="page-wrap"><div className="container py-20 text-center text-red-400">{error}</div></div>;

  return (
    <div className="dash-content">
      <div className="container">
        {/* Hero Stats */}
        <div className="dash-hero" style={{ paddingTop: `calc(var(--nav-height) + var(--space-6))` }}>
          <div className="dash-welcome">
            <div className="dash-welcome-left">
              <div className="dash-avatar" style={{ marginRight: 'var(--space-4)' }}>{user?.initials}</div>
              <div>
                <div className="dash-greeting">Good to see you again 👋</div>
                <div className="dash-name">{user?.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>{user?.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="/find-team" className="btn btn-secondary">🔍 Find Teams</a>
              <a href="/create-project" className="btn btn-primary">➕ New Project</a>
            </div>
          </div>
          <div className="dash-stats-row">
            <div className="card dash-stat-card">
              <div className="dash-stat-num">{stats.totalProjects || 0}</div>
              <div className="dash-stat-label">Total Projects</div>
            </div>
            <div className="card dash-stat-card">
              <div className="dash-stat-num">{stats.recruiting || 0}</div>
              <div className="dash-stat-label">Recruiting</div>
            </div>
            <div className="card dash-stat-card">
              <div className="dash-stat-num">{stats.active || 0}</div>
              <div className="dash-stat-label">Active</div>
            </div>
            <div className="card dash-stat-card">
              <div className="dash-stat-num">{stats.myProjects || 0}</div>
              <div className="dash-stat-label">My Projects</div>
            </div>
          </div>
        </div>

        <div className="dash-layout">
          {/* Main Content */}
          <div>
            <div className="tab-bar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={`tab-panel ${activeTab === 'all' ? 'active' : ''}`} id="tab-all">
              <div className="section-top">
                <h2>All Projects</h2>
              </div>
              <div className="grid-auto">
                {filteredProjects.length ? filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                )) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-title">No projects</div>
                    <div className="empty-state-text">Browse teams to get started!</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card profile-card">
              <div className="dash-avatar" style={{ margin: '0 auto var(--space-3)' }}>{user?.initials}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                {user?.email}
              </div>
              <span className="badge badge-success">Active</span>
              <div className="profile-skills" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                <span className="badge">React</span>
                <span className="badge">TypeScript</span>
                <span className="badge">Node.js</span>
              </div>
              <div className="divider"></div>
              <a href="/create-project" className="btn btn-primary btn-full">➕ Create Project</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

