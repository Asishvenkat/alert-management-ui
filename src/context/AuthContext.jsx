import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const loadUserCb = useCallback(async () => {
    if (token) {
      await loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUserCb();
  }, [loadUserCb]);

  const loadUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      // Response shapes can vary: some endpoints return { success, message, data: { ... } }
      // while DRF RetrieveAPIView returns the raw serialized object. Handle both.
      const payload = response?.data;
      let userPayload = payload?.data ?? payload;
      // If nested under `user` key (some endpoints), unwrap it
      if (userPayload && userPayload.user) userPayload = userPayload.user;
      setUser(userPayload);
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
  const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
  setToken(token);
  setUser(user);

  // Return the user so callers can make immediate decisions without waiting for context state to update
  return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};