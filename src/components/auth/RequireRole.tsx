import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getDefaultRouteForRole } from '../../lib/roleRoutes';

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Vérification de votre session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect based on the current user's role to their own space
    return <Navigate to={getDefaultRouteForRole(currentUser.role)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
