import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProblems } from '../hooks/useProblems';
import { useProjects } from '../hooks/useProjects';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';

export default function BusinessDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const myProblems = useProblems({ page: 1, limit: 5, mine: true });
  const openProblems = useProblems({ page: 1, limit: 1, mine: true, status: 'open' });
  const activeProjects = useProjects({ status: 'active', limit: 5 });
  const completedProjects = useProjects({ status: 'completed', limit: 1 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.businessName || user?.name}
        </h1>
        <p className="mt-1 text-slate-500">Here's an overview of your problems and projects.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Problems Posted" value={myProblems.data?.pagination.total ?? '—'} />
        <StatCard label="Open Problems" value={openProblems.data?.pagination.total ?? '—'} />
        <StatCard label="Active Projects" value={activeProjects.data?.pagination.total ?? '—'} />
        <StatCard label="Completed Projects" value={completedProjects.data?.pagination.total ?? '—'} />
      </div>

      <Link
        to="/problems/create"
        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + Post a Problem
      </Link>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">My Problems</h2>
          <Link to="/problems?mine=true" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          {myProblems.isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {myProblems.data && myProblems.data.problems.length === 0 && (
            <EmptyState
              title="No problems posted yet."
              description="Post your first problem to start receiving proposals."
              action={
                <Link
                  to="/problems/create"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  + Post a Problem
                </Link>
              }
            />
          )}
          {myProblems.data && myProblems.data.problems.length > 0 && (
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {myProblems.data.problems.map((problem) => (
                <Link
                  key={problem._id}
                  to={`/problems/${problem._id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{problem.title}</p>
                    <p className="text-sm text-slate-500">
                      ${problem.budgetMin.toLocaleString()} – ${problem.budgetMax.toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                    {problem.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Active Projects</h2>
          <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          {activeProjects.isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {activeProjects.data && activeProjects.data.projects.length === 0 && (
            <EmptyState
              title="No active projects yet."
              description="Accept a developer's proposal on one of your problems to start a project."
            />
          )}
          {activeProjects.data && activeProjects.data.projects.length > 0 && (
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {activeProjects.data.projects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{project.title}</p>
                    <p className="text-sm text-slate-500">${project.totalBudget.toLocaleString()}</p>
                  </div>
                  <ProjectStatusBadge status={project.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
