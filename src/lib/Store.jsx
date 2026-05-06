import { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('urbanpulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await api.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Load notifications
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const userId = user._id || user.id || user.name; // fallback to name if no ID
          const data = await api.getNotifications(userId);
          setNotifications(data);
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      };
      fetchNotifications();
      // Optional: Polling every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Save user to local storage for persistence
  useEffect(() => {
    if (user) localStorage.setItem('urbanpulse_user', JSON.stringify(user));
    else localStorage.removeItem('urbanpulse_user');
  }, [user]);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      if (data && data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data?.message || "Login failed" };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Server connection error" };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const data = await api.signup(name, email, password);
      if (data && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data?.message || "Signup failed" };
    } catch (err) {
      console.error("Signup error:", err);
      return { success: false, message: "Server connection error" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urbanpulse_user');
  };

  const addComplaint = async (complaint) => {
    try {
      const newComplaint = {
        ...complaint,
        user: user?.name || 'Anonymous',
        userId: user?._id || user?.id
      };
      const saved = await api.addComplaint(newComplaint);
      setComplaints(prev => [saved, ...prev]);
    } catch (err) {
      console.error("Add complaint error:", err);
    }
  };

  const updateComplaintStatus = async (id, updates) => {
    try {
      const payload = typeof updates === 'string' ? { status: updates } : updates;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setComplaints(prev => prev.map(c => c._id === id ? updated : c));
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await api.deleteComplaint(id);
      setComplaints(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error("Delete complaint error:", err);
    }
  };

  const upvoteComplaint = async (id, userId) => {
    try {
      const updated = await api.upvoteComplaint(id, userId);
      setComplaints(prev => prev.map(c => c._id === id ? updated : c));
      return updated;
    } catch (err) {
      console.error("Upvote error:", err);
    }
  };

  const addComment = async (id, user, text) => {
    try {
      const updated = await api.addComment(id, user, text);
      setComplaints(prev => prev.map(c => c._id === id ? updated : c));
      return updated;
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  const uploadImages = async (files) => {
    try {
      const fileToDataURL = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const urls = [];
      for (const file of files) {
        const base64 = await fileToDataURL(file);
        urls.push(base64);
      }
      return urls;
    } catch (err) {
      console.error("Upload error:", err);
      return [];
    }
  };

  const assignDepartment = async (id, department) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: department })
      });
      if (!res.ok) throw new Error("Assignment failed");
      const updated = await res.json();
      setComplaints(prev => prev.map(c => c._id === id ? updated : c));
    } catch (err) {
      console.error("Assign dept error:", err);
    }
  };

  return (
    <StoreContext.Provider value={{
      user, loading, login, signup, logout,
      complaints: complaints || [], 
      addComplaint, updateComplaintStatus, deleteComplaint,
      upvoteComplaint, addComment,
      notifications: notifications || [], 
      markNotificationRead,
      uploadImages, assignDepartment
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
