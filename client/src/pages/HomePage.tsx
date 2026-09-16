import { Link } from 'react-router-dom';
import ApiConnectionTest from '../components/ApiConnectionTest';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useLogout';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logoutMutation = useLogout();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">SkillBridge</h1>
      <p className="mt-3 max-w-md text-slate-600">
        Turn real-world problems into real opportunities.
      </p>

      <div className="mt-6">
        {!isInitialized && <p className="text-sm text-slate-400">Checking session…</p>}

        {isInitialized && user && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-slate-700">
              Signed in as <span className="font-medium">{user.name}</span> ({user.role})
            </p>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        )}

        {isInitialized && !user && (
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="font-medium text-slate-900 hover:underline">
              Sign in
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/register" className="font-medium text-slate-900 hover:underline">
              Create an account
            </Link>
          </div>
        )}
      </div>

      <ApiConnectionTest />
    </div>
  );
}
