import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null;
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}