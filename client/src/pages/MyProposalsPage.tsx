import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProposals } from '../hooks/useMyProposals';
import { useWithdrawProposal } from '../hooks/useWithdrawProposal';
import ProposalStatusBadge from '../components/ProposalStatusBadge';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function MyProposalsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, isFetching } = useMyProposals({ page, limit: 10 });
  const withdrawMutation = useWithdrawProposal();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleWithdraw = (proposalId: string) => {
    withdrawMutation.mutate(proposalId, {
      onSuccess: () => setConfirmingId(null),
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">My Proposals</h1>
      <p className="mt-1 text-slate-600">Track the problems you've applied to.</p>

      <div className="mt-8">
        {isLoading && <p className="text-center text-slate-500">Loading your proposals…</p>}

        {isError && (
          <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-700">
            {getErrorMessage(error)}
          </div>
        )}

        {data && data.proposals.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-500">
            You haven't submitted any proposals yet.{' '}
            <Link to="/problems" className="font-medium text-slate-900 hover:underline">
              Browse problems
            </Link>{' '}
            to get started.
          </div>
        )}

        {data && data.proposals.length > 0 && (
          <>
            <div className={`space-y-3 ${isFetching ? 'opacity-60' : ''}`}>
              {data.proposals.map((proposal) => (
                <div
                  key={proposal._id}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/problems/${proposal.problem._id}`}
                        className="font-semibold text-slate-900 hover:underline"
                      >
                        {proposal.problem.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-400">
                        Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ProposalStatusBadge status={proposal.status} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-400">Your proposed budget</dt>
                      <dd className="font-medium text-slate-800">
                        ${proposal.proposedBudget.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Estimated duration</dt>
                      <dd className="font-medium text-slate-800">
                        {proposal.estimatedDuration ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Problem status</dt>
                      <dd className="font-medium capitalize text-slate-800">
                        {proposal.problem.status.replace('_', ' ')}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
                    <Link
                      to={`/problems/${proposal.problem._id}`}
                      className="text-sm font-medium text-slate-700 hover:underline"
                    >
                      View Problem
                    </Link>

                    {proposal.status === 'pending' &&
                      (confirmingId === proposal._id ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">Withdraw this proposal?</span>
                          <button
                            onClick={() => handleWithdraw(proposal._id)}
                            disabled={withdrawMutation.isPending}
                            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                          >
                            {withdrawMutation.isPending ? 'Withdrawing…' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="text-sm font-medium text-slate-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(proposal._id)}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Withdraw Proposal
                        </button>
                      ))}
                  </div>
                </div>
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
