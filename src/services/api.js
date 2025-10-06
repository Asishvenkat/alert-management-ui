import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://alert-management-system-1.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getCurrentUser: () => api.get('/auth/me/'),
};

// Admin Alert APIs - Django REST Framework URLs
export const adminAlertAPI = {
  createAlert: (alertData) => api.post('/admin/alerts/', alertData),
  getAlerts: (params) => api.get('/admin/alerts/', { params }),
  getAlertById: (id) => api.get(`/admin/alerts/${id}/`),
  updateAlert: (id, data) => api.put(`/admin/alerts/${id}/`, data),
  archiveAlert: (id) => api.delete(`/admin/alerts/${id}/archive/`),
  triggerAlert: (id) => api.post(`/admin/alerts/${id}/trigger/`),
};

// User Alert APIs - Django REST Framework URLs
export const userAlertAPI = {
  getAlerts: () => api.get('/user/alerts/'),
  markAsRead: (alertId) => api.put(`/user/alerts/${alertId}/mark_read/`),
  markAsUnread: (alertId) => api.put(`/user/alerts/${alertId}/mark_unread/`),
  snoozeAlert: (alertId) => api.post(`/user/alerts/${alertId}/snooze/`),
  getSnoozedAlerts: () => api.get('/user/alerts/snoozed/'),
};

// Analytics APIs
export const analyticsAPI = {
  getSystemAnalytics: () => api.get('/analytics/'),
  getAlertAnalytics: (alertId) => api.get(`/analytics/alerts/${alertId}/`),
};

export default api;