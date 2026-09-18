import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProblem } from '../hooks/useProblem';
import { useProblemProposals } from '../hooks/useProblemProposals';
import { useAcceptProposal } from '../hooks/useAcceptProposal';
import { useRejectProposal } from '../hooks/useRejectProposal';
import ProposalStatusBadge from '../components/ProposalStatusBadge';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function ProblemProposalsPage() {
  const { id } = useParams<{ id: string }>();
  const problemQuery = useProblem(id);
  const proposalsQuery = useProblemProposals(id);
  const acceptMutation = useAcceptProposal(id as string);
  const rejectMutation = useRejectProposal(id as string);
  const [confirmingAcceptId, setConfirmingAcceptId] = useState<string | null>(null);
  const [confirmingRejectId, setConfirmingRejectId] = useState<string | null>(null);

  const problem = problemQuery.data?.problem;
  const canAcceptOrReject = problem?.status === 'open';

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        to={id ? `/problems/${id}` : '/problems'}
        className="text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        ← Back to problem
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {problem ? `Proposals for "${problem.title}"` : 'Proposals'}
      </h1>
      {problem && (
        <p className="mt-1 text-sm text-slate-500">
          Problem status: <span className="font-medium capitalize">{problem.status.replace('_', ' ')}</span>
        </p>
      )}

      <div className="mt-8">
        {proposalsQuery.isLoading && (
          <p className="text-center text-slate-500">Loading proposals…</p>
        )}

        {proposalsQuery.isError && (
          <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-700">
            {getErrorMessage(proposalsQuery.error)}
          </div>
        )}

        {proposalsQuery.data && proposalsQuery.data.proposals.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No proposals yet.
          </div>
        )}

        {proposalsQuery.data && proposalsQuery.data.proposals.length > 0 && (
          <div className="space-y-4">
            {proposalsQuery.data.proposals.map((proposal) => (
              <div
                key={proposal._id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{proposal.developer.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ProposalStatusBadge status={proposal.status} />
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
                  {proposal.coverLetter}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-slate-400">Proposed budget</dt>
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
                </dl>

                {proposal.status === 'pending' && canAcceptOrReject && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                    {confirmingAcceptId === proposal._id ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">
                          Accept {proposal.developer.name} for this problem?
                        </span>
                        <button
                          onClick={() =>
                            acceptMutation.mutate(proposal._id, {
                              onSuccess: () => setConfirmingAcceptId(null),
                            })
                          }
                          disabled={acceptMutation.isPending}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {acceptMutation.isPending ? 'Accepting…' : 'Confirm Accept'}
                        </button>
                        <button
                          onClick={() => setConfirmingAcceptId(null)}
                          className="text-sm font-medium text-slate-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : confirmingRejectId === proposal._id ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Reject this proposal?</span>
                        <button
                          onClick={() =>
                            rejectMutation.mutate(proposal._id, {
                              onSuccess: () => setConfirmingRejectId(null),
                            })
                          }
                          disabled={rejectMutation.isPending}
                          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
                        </button>
                        <button
                          onClick={() => setConfirmingRejectId(null)}
                          className="text-sm font-medium text-slate-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setConfirmingAcceptId(proposal._id)}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setConfirmingRejectId(proposal._id)}
                          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}

                {acceptMutation.isError && acceptMutation.variables === proposal._id && (
                  <p className="mt-2 text-xs text-red-600">{getErrorMessage(acceptMutation.error)}</p>
                )}
                {rejectMutation.isError && rejectMutation.variables === proposal._id && (
                  <p className="mt-2 text-xs text-red-600">{getErrorMessage(rejectMutation.error)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
