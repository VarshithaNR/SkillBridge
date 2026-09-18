import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Guards a route behind authentication, and optionally a set of roles.
 * Waits for `isInitialized` (the session-restore attempt on page load) before
 * deciding — otherwise a logged-in user refreshing the page would be
 * bounced to /login for a flash before their session finishes restoring.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Checking session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const ownDashboard =
      user.role === 'developer'
        ? '/developer/dashboard'
        : user.role === 'business'
          ? '/business/dashboard'
          : '/admin/dashboard';
    return <Navigate to={ownDashboard} replace />;
  }

  return <>{children}</>;
}
