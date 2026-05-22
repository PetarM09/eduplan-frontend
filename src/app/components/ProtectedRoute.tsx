import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, Uloga } from '@/context/AuthContext';
import { GraduationCap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Uloga[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl relative z-10 animate-pulse">
            <GraduationCap className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        <p className="mt-6 text-sm font-semibold text-indigo-900 tracking-wide uppercase animate-pulse">
          EduPlan se učitava...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.uloga)) {
    // Redirect unauthorized roles to their default home page
    if (user.uloga === 'SUPER_ADMIN') {
      return <Navigate to="/super-dashboard" replace />;
    } else if (['KOORDINATOR', 'ADMIN', 'DIREKTOR'].includes(user.uloga)) {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
