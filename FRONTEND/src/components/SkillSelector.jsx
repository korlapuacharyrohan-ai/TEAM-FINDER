import React, { useState, useEffect, useRef } from 'react';
import { getSkills } from '../api';

export default function SkillSelector({ selectedSkills = [], onChange, maxSelections = 8 }) {
  const [allSkills, setAllSkills] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSkills() {
      try {
        setError('');
        const res = await getSkills();
        setAllSkills(res.map(s => s.name));
      } catch (err) {
        console.error('Skill sync failure:', err);
        setError('Could not load skills — please refresh');
        setAllSkills([]);
      }
    }
    loadSkills();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter(s => s !== skill));
    } else {
      if (selectedSkills.length < maxSelections) {
        onChange([...selectedSkills, skill]);
      }
    }
    setQuery('');
    setIsOpen(false);
  };

  const removeSkill = (skill, e) => {
    e.stopPropagation();
    onChange(selectedSkills.filter(s => s !== skill));
  };

  const filteredSkills = allSkills.filter(s => 
    s.toLowerCase().includes(query.toLowerCase()) && !selectedSkills.includes(s)
  );

  return (
    <div className="skill-selector" ref={wrapperRef} style={{ position: 'relative' }}>
      <div 
        style={{ 
          display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '14px 16px', 
          background: 'var(--bg-darker)', border: '1px solid var(--border-muted)', borderRadius: '18px', 
          minHeight: '56px', cursor: 'text', transition: 'border-color 0.2s'
        }}
        onClick={() => setIsOpen(true)}
      >
        {selectedSkills.map(skill => (
          <span key={skill} style={{ 
            background: 'var(--primary-soft)', color: 'var(--primary)', padding: '6px 14px', 
            borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(255,122,24,0.1)',
            display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.02em'
          }}>
            {skill}
            <button type="button" onClick={(e) => removeSkill(skill, e)} style={{
              background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontSize: '1.2rem', lineHeight: 1, display: 'flex', alignItems: 'center'
            }}>&times;</button>
          </span>
        ))}
        {selectedSkills.length < maxSelections && (
          <input 
            type="text" 
            value={query} 
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedSkills.length === 0 ? "Search technologies or domains..." : ""}
            style={{ 
              background: 'transparent', border: 'none', color: 'white', 
              outline: 'none', flexGrow: 1, minWidth: '150px', fontSize: '1rem'
            }}
          />
        )}
      </div>

      {isOpen && (
        <div className="glass" style={{
          position: 'absolute', top: 'calc(100% + 12px)', left: 0, right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border-muted)', borderRadius: '20px', 
          maxHeight: '260px', overflowY: 'auto', zIndex: 100, boxShadow: 'var(--shadow-lg)', padding: '8px'
        }}>
          {filteredSkills.length > 0 ? (
            filteredSkills.map(skill => (
              <div 
                key={skill} 
                onClick={() => toggleSkill(skill)}
                style={{ 
                  padding: '12px 16px', color: 'white', cursor: 'pointer',
                  borderRadius: '12px', transition: 'all 0.2s', fontWeight: 500,
                  fontSize: '0.95rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--primary-soft)';
                  e.target.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'white';
                }}
              >
                {skill}
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', fontSize: '0.9rem' }}>
              {allSkills.length === 0 ? "Synchronizing skills registry..." : "No operational matches found."}
            </div>
          )}
        </div>
      )}
      {error && (
        <div style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '8px', fontWeight: 600 }}>
          {error}
        </div>
      )}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'right', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {selectedSkills.length} / {maxSelections} MAX LOAD
      </div>
    </div>
  );
}
