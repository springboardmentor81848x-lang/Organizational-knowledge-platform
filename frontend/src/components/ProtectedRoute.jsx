import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../api/authService';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.replace('ROLE_', '').toLowerCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const rolePaths = {
      admin: '/admin/dashboard',
      hr: '/hr/dashboard',
      manager: '/manager/dashboard',
      employee: '/employee/dashboard',
    };
    return <Navigate to={rolePaths[userRole] || '/login'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;