import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

/**
 * Wraps ProtectedRoute's job plus a role check. A logged-in user whose
 * role isn't in `roles` is redirected to their own dashboard rather
 * than allowed to see a 403 mid-app - matches "customer must NOT be
 * able to access staff/admin routes" requirement at the UI layer
 * (the backend enforces it regardless).
 */
const dashboardPathFor = (role) => {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'BRANCH_STAFF') return '/staff/dashboard';
  return '/customer/dashboard';
};

const RoleRoute = ({ roles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={dashboardPathFor(user.role)} replace />;
  }

  return children;
};

export default RoleRoute;
