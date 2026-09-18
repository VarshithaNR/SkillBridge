import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProblems } from '../hooks/useProblems';
import ProblemCard from '../components/ProblemCard';
import { EmptyState } from '../components/EmptyState';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { ProblemDifficulty, ProblemListQuery, ProblemLocationType } from '../types/problem';

const DIFFICULTIES: ProblemDifficulty[] = ['beginner', 'intermediate', 'advanced'];
const LOCATION_TYPES: ProblemLocationType[] = ['remote', 'onsite', 'hybrid'];

export default function ProblemsPage() {
  const [searchParams] = useSearchParams();
  const mine = searchParams.get('mine') === 'true';
  const user = useAuthStore((state) => state.user);
  const isOwner = mine && user?.role === 'business';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty | ''>('');
  const [locationType, setLocationType] = useState<ProblemLocationType | ''>('');
  const [page, setPage] = useState(1);

  const query: ProblemListQuery = {
    page,
    limit: 9,
    ...(isOwner && { mine: true }),
    ...(search && { search }),
    ...(category && { category }),
    ...(difficulty && { difficulty }),
    ...(locationType && { locationType }),
  };

  const { data, isLoading, isError, error, isFetching } = useProblems(query);

  const resetToFirstPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isOwner ? 'My Problems' : 'Problem Marketplace'}
          </h1>
          <p className="mt-1 text-slate-600">
            {isOwner
              ? 'Every problem you have posted, across every status.'
              : 'Real problems, posted by real businesses.'}
          </p>
        </div>
        {isOwner && (
          <Link
            to="/problems/create"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Post a Problem
          </Link>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          type="search"
          placeholder="Search title or description…"
          value={search}
          onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          type="text"
          placeholder="Category…"
          value={category}
          onChange={(e) => resetToFirstPage(setCategory)(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={difficulty}
          onChange={(e) => resetToFirstPage(setDifficulty)(e.target.value as ProblemDifficulty | '')}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm capitalize"
        >
          <option value="">Any difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={locationType}
          onChange={(e) =>
            resetToFirstPage(setLocationType)(e.target.value as ProblemLocationType | '')
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm capitalize sm:col-span-1"
        >
          <option value="">Any location</option>
          {LOCATION_TYPES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-center text-slate-500">Loading problems…</p>}

        {isError && (
          <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-700">
            {getErrorMessage(error)}
          </div>
        )}

        {data && data.problems.length === 0 && (
          <EmptyState
            title={isOwner ? 'No problems posted yet.' : 'No problems match your filters yet.'}
            description={
              isOwner
                ? 'Post your first problem to start receiving proposals from developers.'
                : 'Try broadening your search.'
            }
            action={
              isOwner ? (
                <Link
                  to="/problems/create"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  + Post a Problem
                </Link>
              ) : undefined
            }
          />
        )}

        {data && data.problems.length > 0 && (
          <>
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
              {data.problems.map((problem) => (
                <ProblemCard key={problem._id} problem={problem} />
              ))}
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
