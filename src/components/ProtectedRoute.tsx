import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking for authentication
  if (loading) {
    return null; // Or a loading spinner
  }

  // If authenticated, show the child route. Otherwise, redirect to login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;