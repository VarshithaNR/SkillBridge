import type { MilestoneStatus } from '../types/milestone';

const STYLES: Record<MilestoneStatus, string> = {
  pending: 'bg-slate-100 text-slate-500 border-slate-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const LABELS: Record<MilestoneStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
