const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  
  signup: async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_URL}/users`);
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Complaints
  getComplaints: async () => {
    const res = await fetch(`${API_URL}/complaints`);
    return res.json();
  },

  addComplaint: async (complaint) => {
    const res = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaint)
    });
    return res.json();
  },

  updateComplaintStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  deleteComplaint: async (id) => {
    const res = await fetch(`${API_URL}/complaints/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  getComplaint: async (id) => {
    const res = await fetch(`${API_URL}/complaints/${id}`);
    return res.json();
  },

  upvoteComplaint: async (id, userId) => {
    const res = await fetch(`${API_URL}/complaints/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  addComment: async (id, user, text) => {
    const res = await fetch(`${API_URL}/complaints/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, text })
    });
    return res.json();
  },

  // Notifications
  getNotifications: async (userId) => {
    const res = await fetch(`${API_URL}/notifications/${userId}`);
    return res.json();
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return res.json();
  }
};
