import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { UserRole } from '../../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('🔒 ProtectedRoute check:', { user: !!user, profile: !!profile, loading, role: profile?.role });

  if (loading) {
    console.log('🔒 Still loading auth...');
    return <LoadingSpinner fullScreen />;
  }

  if (!user || !profile) {
    console.log('🔒 No user/profile, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    console.log('🔒 Role not allowed, redirecting to correct dashboard');
    // Redirect to appropriate dashboard based on role
    switch (profile.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'subadmin':
        return <Navigate to="/subadmin/dashboard" replace />;
      case 'agent':
        return <Navigate to="/agent/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  console.log('✅ Access granted to protected route');
  return <>{children}</>;
};
