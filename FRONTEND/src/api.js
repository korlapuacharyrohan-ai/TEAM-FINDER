export const API_BASE = import.meta.env.VITE_API_BASE || "https://team-finder-3.onrender.com/api";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
}

export async function fetchData(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "API request failed");
  }
  return data;
}

export async function loginApi(email, password) {
  const data = await fetchData("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function registerApi(name, email, password) {
  const data = await fetchData("auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
  localStorage.setItem("token", data.token);
  return data;
}

export function logoutApi() {
  localStorage.removeItem("token");
}
