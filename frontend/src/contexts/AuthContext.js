// AuthContext.js - Handles user authentication state
// Author: Emmanuel Rodriguez & Sarah Chen
// Created: Oct 2, 2025
// Last modified: Oct 3, 2025 (fixed token refresh bug)

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// TODO: Move this to environment config
// Configure axios defaults (using localhost for dev)
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Add request interceptor for debugging
if (process.env.NODE_ENV === 'development') {
  axios.interceptors.request.use(request => {
    console.log('🔄 API Request:', request.method?.toUpperCase(), request.url);
    return request;
  });
  
  axios.interceptors.response.use(
    response => {
      console.log('✅ API Response:', response.status, response.config.url);
      return response;
    },
    error => {
      console.log('❌ API Error:', error.response?.status, error.config?.url);
      return Promise.reject(error);
    }
  );
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Debug state (remove in production)
  const [authAttempts, setAuthAttempts] = useState(0);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      setAuthAttempts(prev => prev + 1);
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 User loaded successfully:', response.data.email);
      }
    } catch (error) {
      console.error('❌ Failed to load user:', error.response?.data?.message || error.message);
      // Don't logout on 401 - token might just be expired
      if (error.response?.status === 401) {
        console.log('🔄 Token expired, clearing auth state...');
      }
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthAttempts(prev => prev + 1);
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token and update state
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎉 Login successful for:', user.email);
      }
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed. Please check your connection and try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed. Please check your connection and try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/user/profile', profileData);
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Profile update failed' 
      };
    }
  };

  const updateSecuritySettings = async (securitySettings) => {
    try {
      const response = await axios.put('/api/user/security', { securitySettings });
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Security settings update failed' 
      };
    }
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateSecuritySettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};