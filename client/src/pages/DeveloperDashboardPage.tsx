import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProblems } from '../hooks/useProblems';
import { useMyProposals } from '../hooks/useMyProposals';
import { useProjects } from '../hooks/useProjects';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import ProblemCard from '../components/ProblemCard';
import ProposalStatusBadge from '../components/ProposalStatusBadge';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';

export default function DeveloperDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const recentProblems = useProblems({ page: 1, limit: 4 });
  const pendingProposals = useMyProposals({ status: 'pending', limit: 1 });
  const acceptedProposals = useMyProposals({ status: 'accepted', limit: 1 });
  const recentProposals = useMyProposals({ page: 1, limit: 5 });
  const activeProjects = useProjects({ status: 'active', limit: 5 });
  const completedProjects = useProjects({ status: 'completed', limit: 1 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="mt-1 text-slate-500">Here's what's happening with your work.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Proposals" value={pendingProposals.data?.pagination.total ?? '—'} />
        <StatCard label="Accepted Proposals" value={acceptedProposals.data?.pagination.total ?? '—'} />
        <StatCard label="Active Projects" value={activeProjects.data?.pagination.total ?? '—'} />
        <StatCard label="Completed Projects" value={completedProjects.data?.pagination.total ?? '—'} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/problems"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Browse Problems
        </Link>
        <Link
          to="/proposals"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          My Proposals
        </Link>
        <Link
          to="/projects"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          My Projects
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recommended Problems</h2>
          <Link to="/problems" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          {recentProblems.isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {recentProblems.data && recentProblems.data.problems.length === 0 && (
            <EmptyState title="No open problems right now." description="Check back soon." />
          )}
          {recentProblems.data && recentProblems.data.problems.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentProblems.data.problems.map((problem) => (
                <ProblemCard key={problem._id} problem={problem} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">My Active Projects</h2>
          <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          {activeProjects.isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {activeProjects.data && activeProjects.data.projects.length === 0 && (
            <EmptyState
              title="No active projects yet."
              description="Once a business accepts one of your proposals, it will show up here."
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

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Recent Proposal Activity</h2>
        <div className="mt-4">
          {recentProposals.isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {recentProposals.data && recentProposals.data.proposals.length === 0 && (
            <EmptyState
              title="You haven't submitted any proposals yet."
              description="Browse open problems and submit your first proposal."
            />
          )}
          {recentProposals.data && recentProposals.data.proposals.length > 0 && (
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {recentProposals.data.proposals.map((proposal) => (
                <Link
                  key={proposal._id}
                  to={`/problems/${proposal.problem._id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                >
                  <p className="font-medium text-slate-900">{proposal.problem.title}</p>
                  <ProposalStatusBadge status={proposal.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
