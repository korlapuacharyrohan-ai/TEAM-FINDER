import { client } from './api/client';

export const loginApi = (email, password) => 
  client.post('auth/login', { email, password });

export const registerApi = (name, email, password) => 
  client.post('auth/register', { name, email, password });

export const logoutApi = () => 
  client.post('auth/logout');

export const getMe = () => 
  client.get('auth/me');

export const exchangeCodeForToken = (code) => 
  client.post('auth/exchange', { code });

export const getUserProfile = (userId) => 
  client.get(`users/${userId}`);

export const updateUserProfile = (profileData) => 
  client.patch('users/me', profileData);

export const updateUserSkills = (skills) =>
  client.post('users/me/skills', { skills });

export const getSkills = () => 
  client.get('skills');

export const getProjectMembers = (projectId) => 
  client.get(`projects/${projectId}/members`);

export const endorseUser = (projectId, endorsedUserId, skill) => 
  client.post(`projects/${projectId}/endorse`, { endorsed_user_id: endorsedUserId, skill });

export const getNotifications = () => 
  client.get('notifications');

export const markNotificationRead = (id) => 
  client.patch(`notifications/${id}/read`);

export const markAllNotificationsRead = () => 
  client.patch('notifications/read-all');

export const getUsers = (params = {}) => {
  const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''));
  const query = new URLSearchParams(cleanParams).toString();
  return client.get(`users${query ? `?${query}` : ''}`);
};

export const getProject = (id) =>
  client.get(`projects/${id}`);

export const createProject = (projectData) =>
  client.post('projects', projectData);

export const getHackathons = () => 
  client.get("hackathons");

export const getHackathon = (id) => 
  client.get(`hackathons/${id}`);

// Join Request System
export const applyToProject = (projectId, message) => 
  client.post(`projects/${projectId}/apply`, { message });

export const getProjectRequests = (projectId) => 
  client.get(`projects/${projectId}/requests`);

export const respondToProjectRequest = (requestId, status) => 
  client.patch(`join-requests/${requestId}/${status}`);

// AI & Match Score
export const getMatchScore = (targetUserId) => 
  client.get(`users/${targetUserId}/match-score`);

export const getTeammateSuggestions = (projectId) => 
  client.get(`projects/${projectId}/suggest-teammates`);

// Project Management
export const deleteProject = (projectId) => 
  client.delete(`projects/${projectId}`);

export const updateProjectSettings = (projectId, data) => 
  client.put(`projects/${projectId}`, data);
