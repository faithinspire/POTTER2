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

  // Always show loading while auth is initializing
  if (loading) {
    console.log('🔒 Still loading auth...');
    return <LoadingSpinner fullScreen />;
  }

  // Check localStorage directly as fallback
  const authToken = localStorage.getItem('auth_token');
  const userProfileStr = localStorage.getItem('user_profile');
  
  if (!user || !profile) {
    // If no user in context but we have localStorage data, wait a bit more
    if (authToken && userProfileStr) {
      console.log('🔒 Found localStorage data, waiting for context to load...');
      return <LoadingSpinner fullScreen />;
    }
    
    console.log('🔒 No user/profile and no localStorage data, redirecting to login');
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
