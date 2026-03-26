// Load API functions in global scope for HTML pages
if (typeof fetch !== 'undefined') {
  const API_BASE = 'http://localhost:5000/api';

  // Import API functions globally
  window.login = async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Login failed');
    const data = await response.json();
    localStorage.setItem('tf_session', JSON.stringify(data));
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    return data;
  };

  window.register = async (name, email, password) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Register failed');
    const data = await response.json();
    localStorage.setItem('tf_session', JSON.stringify(data));
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    return data;
  };

  window.createProject = async (projectData) => {
    const sessionStr = localStorage.getItem('tf_session');
    const token = sessionStr ? JSON.parse(sessionStr).token : null;
    
    // The data is already correctly formatted by the frontend form
    const data = projectData;
    
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Create failed');
    return response.json();
  };

  window.getProjects = async (filters = {}) => {
    const token = JSON.parse(localStorage.getItem('tf_session') || '{}').token;
    const params = new URLSearchParams(filters);
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE}/projects?${params}`, {
      headers
    });
    if (!response.ok) throw new Error('Fetch projects failed');
    return response.json();
  };

  window.getDashboard = async () => {
    const token = JSON.parse(localStorage.getItem('tf_session') || '{}').token;
    const response = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Dashboard fetch failed');
    return response.json();
  };
}
