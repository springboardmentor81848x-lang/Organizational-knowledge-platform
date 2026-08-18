import api from './axiosConfig';
import { jwtDecode } from 'jwt-decode';

const authService = {
  register: async (firstName, lastName, officialEmail, password, departmentId = 1) => {
    try {
      const res = await api.post('/auth/register', {
        firstName,
        lastName,
        officialEmail,
        password,
        departmentId,
      });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  },

  login: async (officialEmail, password) => {
    try {
      const res = await api.post('/auth/login', { officialEmail, password });
      const token = res.data.token;
      localStorage.setItem('jwtToken', token);
      // Decode token to get role
      const decoded = jwtDecode(token);
      const role = decoded.role || decoded.authorities?.[0] || 'ROLE_EMPLOYEE';
      const user = { email: officialEmail, role };
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('jwtToken'),
};

export default authService;