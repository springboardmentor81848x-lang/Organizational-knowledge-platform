import api from './axiosConfig';
import { jwtDecode } from 'jwt-decode';

const authService = {
  register: async (firstName: string, lastName: string, officialEmail: string, password: string, departmentId: number = 1) => {
    try {
      const res = await api.post('/auth/register', {
        firstName,
        lastName,
        officialEmail,
        password,
        departmentId,
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', {
        officialEmail: email,   // ✅ Backend expects "officialEmail"
        password,
      });
      const token = res.data.token;
      localStorage.setItem('jwtToken', token);
      const decoded = jwtDecode(token);
      const role = decoded.role || decoded.authorities?.[0] || 'ROLE_EMPLOYEE';
      const user = { email, role };
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    } catch (error: any) {
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