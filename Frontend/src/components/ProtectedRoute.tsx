import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'cliente' | 'prestador'>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.tipo_usuario && !allowedRoles.includes(user.tipo_usuario)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
