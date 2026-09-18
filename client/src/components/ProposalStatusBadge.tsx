import type { ProposalStatus } from '../types/proposal';

const statusColors: Record<ProposalStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-100 text-slate-600',
};

export default function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[status]}`}
    >
      {status}
    </span>
  );
}
