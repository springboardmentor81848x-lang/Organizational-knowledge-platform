import api from './api';

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export default {
  login,
  signup,
  logout,
};
