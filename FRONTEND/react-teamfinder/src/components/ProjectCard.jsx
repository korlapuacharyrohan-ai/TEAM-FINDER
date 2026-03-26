import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const pct = Math.round((project.currentMembers / project.teamSize) * 100);
  const skills = (project.skills || []).slice(0, 4);
  const extraSkills = project.skills && project.skills.length > 4 
    ? project.skills.length - 4 
    : 0;

  const statusMap = {
    recruiting: { className: 'badge-success', label: 'Recruiting' },
    active: { className: 'badge-warning', label: 'Active' },
    completed: { className: 'badge-info', label: 'Completed' },
  };
  const status = statusMap[project.status] || statusMap.active;

  return (
    <Link to={`/project/${project.id}`} className="card card-clickable">
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        gap: '12px', 
        marginBottom: '14px' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          flex: 1, 
          minWidth: 0 
        }}>
          <div className="avatar">{project.ownerInitials || '??'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-muted)', 
              marginBottom: '2px' 
            }}>
              {project.owner || 'Unknown'}
            </div>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              lineHeight: 1.3, 
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' 
            }}>
              {project.title}
            </h3>
          </div>
        </div>
        <span className={status.className} style={{ flexShrink: 0 }}>
          {status.label}
        </span>
      </div>

      <p style={{ 
        fontSize: '0.85rem', 
        color: 'var(--text-secondary)', 
        lineHeight: 1.6, 
        marginBottom: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden' 
      }}>
        {project.description}
      </p>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px', 
        marginBottom: '16px' 
      }}>
        {skills.map(skill => (
          <span key={skill} className="badge">{skill}</span>
        ))}
        {extraSkills > 0 && (
          <span className="badge badge-info">+{extraSkills}</span>
        )}
      </div>

      <div className="divider" style={{ margin: '12px 0' }}></div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '8px', 
        fontSize: '0.78rem', 
        color: 'var(--text-muted)', 
        marginBottom: '12px' 
      }}>
        <div>📂 <span style={{ color: 'var(--text-secondary)' }}>{project.category}</span></div>
        <div>⏱ <span style={{ color: 'var(--text-secondary)' }}>{project.duration}</span></div>
        <div>👥 <span style={{ color: 'var(--text-secondary)' }}>
          {project.currentMembers}/{project.teamSize} members
        </span></div>
        <div>{project.remote ? '🌐 Remote' : '📍 On-site'}</div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }}></div>
      </div>
      <div style={{ 
        fontSize: '0.72rem', 
        color: 'var(--text-muted)', 
        marginTop: '4px', 
        textAlign: 'right' 
      }}>
        {pct}% filled
      </div>
    </Link>
  );
};

export default ProjectCard;

