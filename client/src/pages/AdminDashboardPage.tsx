import { useUserStats } from '../hooks/useUserStats';
import { useProblems } from '../hooks/useProblems';
import { useProjects } from '../hooks/useProjects';
import { StatCard } from '../components/StatCard';

export default function AdminDashboardPage() {
  const stats = useUserStats();
  const openProblems = useProblems({ page: 1, limit: 1, status: 'open' });
  const allProjects = useProjects({ limit: 1 });
  const activeProjects = useProjects({ status: 'active', limit: 1 });
  const completedProjects = useProjects({ status: 'completed', limit: 1 });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          Admin
        </span>
      </div>
      <p className="-mt-6 text-slate-500">Platform-wide activity across every account.</p>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Users</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats.data?.totalUsers ?? '—'} />
          <StatCard label="Developers" value={stats.data?.developers ?? '—'} />
          <StatCard label="Businesses" value={stats.data?.businesses ?? '—'} />
          <StatCard label="Admins" value={stats.data?.admins ?? '—'} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Problems &amp; Projects
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Open Problems" value={openProblems.data?.pagination.total ?? '—'} />
          <StatCard label="Total Projects" value={allProjects.data?.pagination.total ?? '—'} />
          <StatCard label="Active Projects" value={activeProjects.data?.pagination.total ?? '—'} />
          <StatCard label="Completed Projects" value={completedProjects.data?.pagination.total ?? '—'} />
        </div>
      </div>

      {stats.isError && (
        <p className="text-sm text-red-600">
          Couldn't load user stats — the /users/stats endpoint may be unreachable.
        </p>
      )}
    </div>
  );
}
