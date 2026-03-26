const API_BASE = "http://127.0.0.1:5001/api";

function getAuthHeaders() {
  const token = localStorage.getItem('token') ? JSON.parse(localStorage.getItem('tf_session')).token : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    // SAVE TOKEN
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    throw error;
  }
}
