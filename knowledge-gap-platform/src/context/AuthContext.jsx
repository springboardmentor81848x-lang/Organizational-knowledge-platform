import React, { createContext, useContext, useState } from 'react';
import { mockCurrentUser } from '../services/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(mockCurrentUser);
  const [activeRole, setActiveRole] = useState('employee'); // 'employee' | 'manager' | 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (userData, role = 'employee') => {
    setUser({ ...mockCurrentUser, ...userData, role });
    setActiveRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('auth_token', 'mock-jwt-token-active');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  };

  const switchRole = (role) => {
    setActiveRole(role);
    setUser(prev => ({ ...prev, role }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
