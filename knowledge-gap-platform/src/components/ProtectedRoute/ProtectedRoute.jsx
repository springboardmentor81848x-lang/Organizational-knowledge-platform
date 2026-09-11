import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, activeRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    return <Navigate to={`/${activeRole}/dashboard`} replace />;
  }

  return <Outlet />;
};
