import { useState, type ReactNode } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useLogout';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  end?: boolean;
}

const ICONS = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m21 21-4.3-4.3" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h5l2 2h11v10H3z" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" d="M2 20c1-3 4-5 7-5s6 2 7 5M16 8a3 3 0 1 1 3 3M15 13c2.5.3 4.5 2 5.5 4.5" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10m6 10V4m6 16v-7" />
    </svg>
  ),
};

const NAV_BY_ROLE: Record<'developer' | 'business' | 'admin', NavItem[]> = {
  developer: [
    { label: 'Dashboard', to: '/developer/dashboard', icon: ICONS.grid, end: true },
    { label: 'Browse Problems', to: '/problems', icon: ICONS.search },
    { label: 'My Proposals', to: '/proposals', icon: ICONS.document },
    { label: 'My Projects', to: '/projects', icon: ICONS.folder },
    { label: 'Profile', to: '/developer/dashboard', icon: ICONS.user },
  ],
  business: [
    { label: 'Dashboard', to: '/business/dashboard', icon: ICONS.grid, end: true },
    { label: 'My Problems', to: '/problems?mine=true', icon: ICONS.document },
    { label: 'Post Problem', to: '/problems/create', icon: ICONS.plus },
    { label: 'Projects', to: '/projects', icon: ICONS.folder },
    { label: 'Profile', to: '/business/dashboard', icon: ICONS.user },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: ICONS.grid, end: true },
    { label: 'Users', to: '/admin/dashboard', icon: ICONS.users },
    { label: 'Problems', to: '/problems', icon: ICONS.document },
    { label: 'Projects', to: '/projects', icon: ICONS.folder },
    { label: 'Reports', to: '/admin/dashboard', icon: ICONS.chart },
  ],
};

/**
 * Shared shell for every authenticated dashboard route: a fixed sidebar on
 * desktop that collapses into a slide-over on mobile, plus a top header with
 * the signed-in user and a sign-out action. The role decides which nav items
 * render — admin gets a visually distinct accent so it never looks like a
 * regular account.
 */
export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const navItems = NAV_BY_ROLE[user.role];
  const displayName = user.role === 'business' ? user.businessName || user.name : user.name;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, { onSuccess: () => navigate('/login') });
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <Link to="/" className="text-lg font-bold text-slate-900">
          SkillBridge
        </Link>
        {isAdmin && (
          <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? isAdmin
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden text-sm text-slate-500 lg:block">Welcome back, {displayName}</div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-900">{displayName}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-500">
              {user.role}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
