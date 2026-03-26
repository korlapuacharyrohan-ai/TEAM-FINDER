const API_BASE = '/api'; // Proxied to localhost:5001

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_session') ? JSON.parse(localStorage.getItem('tf_session')).token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export async function login(email, password) {
  const response = await apiClient.post('/auth/login', { email, password });
  const { token, user } = response.data;
  localStorage.setItem('tf_session', JSON.stringify({ token }));
  localStorage.setItem('tf_user', JSON.stringify(user));
  return { token, user };
}

export async function register(name, email, password) {
  const response = await apiClient.post('/auth/register', { name, email, password });
  const { token, user } = response.data;
  localStorage.setItem('tf_session', JSON.stringify({ token }));
  localStorage.setItem('tf_user', JSON.stringify(user));
  return { token, user };
}

// Projects
export async function createProject(projectData) {
  const response = await apiClient.post('/projects', projectData);
  return response.data;
}

export async function getProjects(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const response = await apiClient.get(`/projects?${params}`);
  return response.data;
}

export async function getProjectById(id) {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
}

// Dashboard
export async function getDashboard() {
  const response = await apiClient.get('/dashboard');
  return response.data;
}

export async function logout() {
  localStorage.removeItem('tf_session');
  localStorage.removeItem('tf_user');
}

export default apiClient;
