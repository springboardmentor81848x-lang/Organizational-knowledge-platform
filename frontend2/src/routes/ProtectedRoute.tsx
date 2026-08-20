import { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps): ReactElement | null => {
  const { isAuthenticated, role, isLoading, getRoleDashboardPath } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role as UserRole)) {
    return <Navigate to={getRoleDashboardPath(role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;