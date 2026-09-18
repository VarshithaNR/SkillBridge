import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProjects } from '../hooks/useProjects';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { EmptyState } from '../components/EmptyState';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { ProjectStatus } from '../types/project';

const STATUS_FILTERS: Array<{ label: string; value: ProjectStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function ProjectsListPage() {
  const user = useAuthStore((state) => state.user);
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useProjects({
    page,
    limit: 9,
    ...(status && { status }),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
      <p className="mt-1 text-slate-600">
        {user?.role === 'business'
          ? 'Projects created from your accepted proposals.'
          : user?.role === 'developer'
            ? 'Projects you are currently working on.'
            : 'Every project on the platform.'}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              status === filter.value
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-center text-slate-500">Loading projects…</p>}

        {isError && (
          <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-700">
            {getErrorMessage(error)}
          </div>
        )}

        {data && data.projects.length === 0 && (
          <EmptyState
            title="No projects yet."
            description="Projects appear here automatically once a proposal is accepted."
          />
        )}

        {data && data.projects.length > 0 && (
          <>
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
              {data.projects.map((project) => {
                const otherParty =
                  user?.role === 'business'
                    ? typeof project.developer === 'string'
                      ? 'Developer'
                      : project.developer.name
                    : typeof project.business === 'string'
                      ? 'Business'
                      : project.business.businessName || project.business.name;

                return (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{project.title}</h3>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">With {otherParty}</p>
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      ${project.totalBudget.toLocaleString()}
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.pagination.page <= 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-500">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.pagination.page >= data.pagination.totalPages}
                className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
