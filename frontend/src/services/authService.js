import api from './api';



export const authService = {
    
  // Register new user
  register: async (userData) => {
    const response = await api.post('/api/register', userData);
    return response.data;
  },



  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },



  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },



  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/api/verify/${token}`);
    return response.data;
  },



  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/api/forgot-password', { email });
    return response.data;
  },



  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },



  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },



  // Check if authenticated
  isAuthenticated: () => {
    return localStorage.getItem('authToken') !== null;
  }
};