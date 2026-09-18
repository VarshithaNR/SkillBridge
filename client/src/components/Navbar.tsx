import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useLogout';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'developer'
      ? '/developer/dashboard'
      : user?.role === 'business'
        ? '/business/dashboard'
        : '/admin/dashboard';

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-lg font-bold text-slate-900">
          SkillBridge
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {isInitialized && user && (
            <Link to={dashboardPath} className="font-medium text-slate-700 hover:text-slate-900">
              Dashboard
            </Link>
          )}

          <Link to="/problems" className="font-medium text-slate-700 hover:text-slate-900">
            Browse Problems
          </Link>

          {isInitialized && user && (
            <Link to="/projects" className="font-medium text-slate-700 hover:text-slate-900">
              Projects
            </Link>
          )}

          {isInitialized && user?.role === 'business' && (
            <Link
              to="/problems/create"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Post a Problem
            </Link>
          )}

          {isInitialized && user?.role === 'developer' && (
            <Link to="/proposals" className="font-medium text-slate-700 hover:text-slate-900">
              My Proposals
            </Link>
          )}

          {!isInitialized ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                {user.name} <span className="text-slate-400">({user.role})</span>
              </span>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="font-medium text-slate-900 hover:underline">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-800"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
