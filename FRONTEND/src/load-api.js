// Load API functions in global scope for HTML pages
if (typeof fetch !== 'undefined') {
  const API_BASE = 'https://team-finder-3.onrender.com/api';

  // Import API functions globally
  window.login = async (email, password) => {
    console.log("Calling API... POST", `${API_BASE}/auth/login`);
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Login failed');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    return data;
  };

  window.register = async (name, email, password) => {
    console.log("Calling API... POST", `${API_BASE}/auth/register`);
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Register failed');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    return data;
  };

  window.createProject = async (projectData) => {
    const token = localStorage.getItem('token');
    
    // The data is already correctly formatted by the frontend form
    console.log("Calling API... POST", `${API_BASE}/projects`);
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Create project failed');
    return response.json();
  };

  window.getProjects = async (filters = {}) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(filters);
    const headers = token ? { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    } : { 'Content-Type': 'application/json' };
    console.log("Calling API... GET", `${API_BASE}/projects?${params}`);
    const response = await fetch(`${API_BASE}/projects?${params}`, {
      headers
    });
    if (!response.ok) throw new Error('Fetch projects failed');
    return response.json();
  };

  window.getDashboard = async () => {
    const token = localStorage.getItem('token');
    console.log("Calling API... GET", `${API_BASE}/dashboard`);
    const response = await fetch(`${API_BASE}/dashboard`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
    if (!response.ok) throw new Error('Dashboard fetch failed');
    return response.json();
  };
}
