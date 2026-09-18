import type { ProjectStatus } from '../types/project';

const STYLES: Record<ProjectStatus, string> = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
