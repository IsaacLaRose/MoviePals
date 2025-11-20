import api from './api';



export const authService = {
    
  register: async (userData) => {
    try {
      const response = await api.post('/api/register', userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  },


  login: async (credentials) => {
  const response = await api.post('/api/login', credentials);

  const user = response.data;

  localStorage.setItem("user", JSON.stringify(user));

  if (user._id) {
    localStorage.setItem("userId", user._id);
  } else if (user.id) {
    localStorage.setItem("userId", user.id);
  }

  return user;
},

  logout: () => {
    localStorage.removeItem('user');
  },



  // Verify email
  verifyEmail: async (token, id) => {
    const response = await api.get(`/api/verifyEmail?token=${token}&id=${id}`);
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
