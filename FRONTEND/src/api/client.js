const API_BASE = import.meta.env.VITE_API_BASE || "/api";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}/${endpoint.replace(/^\//, '')}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Must be 'include' for httpOnly cookies
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !url.includes('/auth/me')) {
        // Handle session expiration
        window.location.href = '/login?error=session_expired';
      }
      throw new ApiError(data.error || 'Network error encountered', response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('API Fetch Failure:', error);
    throw new ApiError('Connectivity failure — check network status', 503);
  }
}

export const client = {
  get: (url, options) => request(url, { ...options, method: 'GET' }),
  post: (url, data, options) => request(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (url, data, options) => request(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  patch: (url, data, options) => request(url, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
};
