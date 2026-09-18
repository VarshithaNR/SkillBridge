import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProblem } from '../hooks/useProblem';
import { useMyProposals } from '../hooks/useMyProposals';
import { useWithdrawProposal } from '../hooks/useWithdrawProposal';
import ProposalForm from '../components/ProposalForm';
import ProposalStatusBadge from '../components/ProposalStatusBadge';
import { useAuthStore } from '../stores/authStore';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ProblemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useProblem(id);
  const user = useAuthStore((state) => state.user);
  const isDeveloper = user?.role === 'developer';
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);

  // No dedicated "my proposal for this problem" endpoint exists, so this
  // fetches the developer's proposals (with a generous limit) and matches
  // client-side. Fine at this scale; would move server-side if a developer
  // could realistically have hundreds of proposals.
  const myProposalsQuery = useMyProposals({ limit: 100 }, isDeveloper);
  const myProposal = myProposalsQuery.data?.proposals.find((p) => p.problem._id === id);

  const withdrawMutation = useWithdrawProposal();

  const handleWithdraw = () => {
    if (!myProposal) return;
    withdrawMutation.mutate(myProposal._id, {
      onSuccess: () => setConfirmingWithdraw(false),
    });
  };

  if (isLoading) {
    return <p className="mx-auto max-w-3xl px-6 py-10 text-center text-slate-500">Loading…</p>;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-700">
          {getErrorMessage(error)}
        </div>
        <Link to="/problems" className="mt-4 block text-center text-sm font-medium text-slate-900">
          ← Back to problems
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { problem } = data;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/problems" className="text-sm font-medium text-slate-500 hover:text-slate-900">
        ← Back to problems
      </Link>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{problem.title}</h1>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
            {problem.status.replace('_', ' ')}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-slate-700">{problem.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-400">Category</dt>
            <dd className="font-medium text-slate-800">{problem.category}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Difficulty</dt>
            <dd className="font-medium capitalize text-slate-800">{problem.difficulty}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Budget</dt>
            <dd className="font-medium text-slate-800">
              ${problem.budgetMin.toLocaleString()} – ${problem.budgetMax.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Location</dt>
            <dd className="font-medium capitalize text-slate-800">
              {problem.locationType}
              {problem.location ? ` — ${problem.location}` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Deadline</dt>
            <dd className="font-medium text-slate-800">
              {problem.deadline ? new Date(problem.deadline).toLocaleDateString() : 'Flexible'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Posted by</dt>
            <dd className="font-medium text-slate-800">{problem.postedBy.name}</dd>
          </div>
        </dl>

        {problem.requiredSkills.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-400">Required skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {problem.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {user &&
          (user.role === 'admin' ||
            (user.role === 'business' && problem.postedBy._id === user.id)) && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <Link
                to={`/problems/${problem._id}/proposals`}
                className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                View Proposals
              </Link>
            </div>
          )}

        {isDeveloper && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-semibold text-slate-900">Proposal</h2>

            {myProposalsQuery.isLoading ? (
              <p className="mt-2 text-sm text-slate-500">Checking your proposal status…</p>
            ) : myProposal ? (
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">Proposal Submitted</p>
                  <ProposalStatusBadge status={myProposal.status} />
                </div>

                {myProposal.status === 'pending' && (
                  <div className="mt-3">
                    {confirmingWithdraw ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Withdraw this proposal?</span>
                        <button
                          onClick={handleWithdraw}
                          disabled={withdrawMutation.isPending}
                          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          {withdrawMutation.isPending ? 'Withdrawing…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmingWithdraw(false)}
                          className="text-sm font-medium text-slate-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingWithdraw(true)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Withdraw proposal
                      </button>
                    )}
                    {withdrawMutation.isError && (
                      <p className="mt-2 text-xs text-red-600">
                        {getErrorMessage(withdrawMutation.error)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : problem.status !== 'open' ? (
              <p className="mt-2 text-sm text-slate-500">
                This problem is no longer accepting proposals.
              </p>
            ) : (
              <div className="mt-3">
                <ProposalForm problemId={problem._id} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
