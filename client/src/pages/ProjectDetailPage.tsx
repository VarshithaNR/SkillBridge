import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProject } from '../hooks/useProject';
import { useUpdateProject } from '../hooks/useUpdateProject';
import { useProjectMilestones } from '../hooks/useProjectMilestones';
import { useCreateMilestone } from '../hooks/useCreateMilestone';
import { useUpdateMilestone } from '../hooks/useUpdateMilestone';
import { useDeleteMilestone } from '../hooks/useDeleteMilestone';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { MilestoneStatusBadge } from '../components/MilestoneStatusBadge';
import { EmptyState } from '../components/EmptyState';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { Milestone } from '../types/milestone';

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function AddMilestoneForm({ projectId, onDone }: { projectId: string; onDone: () => void }) {
  const createMilestone = useCreateMilestone(projectId);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    createMilestone.mutate(
      {
        title: title.trim(),
        amount: Number(amount),
        dueDate: dueDate || undefined,
        description: description.trim() || undefined,
      },
      { onSuccess: () => onDone() }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Milestone title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {createMilestone.isError && (
        <p className="text-sm text-red-600">{getErrorMessage(createMilestone.error)}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMilestone.isPending}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {createMilestone.isPending ? 'Adding…' : 'Add Milestone'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function MilestoneRow({
  milestone,
  index,
  isBusiness,
  isDeveloper,
  projectId,
}: {
  milestone: Milestone;
  index: number;
  isBusiness: boolean;
  isDeveloper: boolean;
  projectId: string;
}) {
  const updateMilestone = useUpdateMilestone(projectId);
  const deleteMilestone = useDeleteMilestone(projectId);

  const handleDelete = () => {
    if (window.confirm(`Delete milestone "${milestone.title}"? This cannot be undone.`)) {
      deleteMilestone.mutate(milestone._id);
    }
  };

  const canSubmit =
    isDeveloper && (milestone.status === 'pending' || milestone.status === 'in_progress' || milestone.status === 'rejected');
  const canStart = isDeveloper && milestone.status === 'pending';
  const canReview = isBusiness && milestone.status === 'submitted';
  const canEdit = isBusiness && milestone.status !== 'approved';

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-slate-900">
          {index + 1}. {milestone.title}
        </p>
        {milestone.description && <p className="mt-0.5 text-sm text-slate-500">{milestone.description}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span>${milestone.amount.toLocaleString()}</span>
          <span>Due {formatDate(milestone.dueDate)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MilestoneStatusBadge status={milestone.status} />

        {canStart && (
          <button
            onClick={() => updateMilestone.mutate({ id: milestone._id, payload: { status: 'in_progress' } })}
            disabled={updateMilestone.isPending}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Start Work
          </button>
        )}
        {canSubmit && (
          <button
            onClick={() => updateMilestone.mutate({ id: milestone._id, payload: { status: 'submitted' } })}
            disabled={updateMilestone.isPending}
            className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Submit Milestone
          </button>
        )}
        {canReview && (
          <>
            <button
              onClick={() => updateMilestone.mutate({ id: milestone._id, payload: { status: 'approved' } })}
              disabled={updateMilestone.isPending}
              className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => updateMilestone.mutate({ id: milestone._id, payload: { status: 'rejected' } })}
              disabled={updateMilestone.isPending}
              className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}
        {canEdit && (
          <button
            onClick={handleDelete}
            disabled={deleteMilestone.isPending}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const { data, isLoading, isError, error } = useProject(id);
  const milestonesQuery = useProjectMilestones(id);
  const updateProject = useUpdateProject(id ?? '');

  if (isLoading) {
    return <p className="mx-auto max-w-4xl px-6 py-10 text-center text-slate-500">Loading project…</p>;
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-700">{getErrorMessage(error)}</div>
        <Link to="/projects" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const { project } = data;
  const isBusiness = user?.role === 'business';
  const isDeveloper = user?.role === 'developer';

  const businessInfo = typeof project.business === 'string' ? null : project.business;
  const developerInfo = typeof project.developer === 'string' ? null : project.developer;

  const milestones = milestonesQuery.data ?? [];
  const approvedCount = milestones.filter((m) => m.status === 'approved').length;
  const progressPercent = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/projects" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Back to Projects
      </Link>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
        <div className="flex items-center gap-3">
          <ProjectStatusBadge status={project.status} />
          {isBusiness && project.status === 'active' && (
            <button
              onClick={() => updateProject.mutate({ status: 'completed' })}
              disabled={updateProject.isPending}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {isBusiness && developerInfo && <>Developer: {developerInfo.name}</>}
        {isDeveloper && businessInfo && <>Business: {businessInfo.businessName || businessInfo.name}</>}
        {user?.role === 'admin' && (
          <>
            {businessInfo?.businessName || businessInfo?.name} ↔ {developerInfo?.name}
          </>
        )}
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Overview</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{project.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-slate-400">Budget</p>
            <p className="font-medium text-slate-900">${project.totalBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400">Start Date</p>
            <p className="font-medium text-slate-900">{formatDate(project.startedAt)}</p>
          </div>
          {project.completedAt && (
            <div>
              <p className="text-slate-400">Completed</p>
              <p className="font-medium text-slate-900">{formatDate(project.completedAt)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Overall Progress</h2>
          <span className="text-sm font-medium text-slate-700">{progressPercent}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Milestones</h2>
          {isBusiness && !showAddMilestone && (
            <button
              onClick={() => setShowAddMilestone(true)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + Add Milestone
            </button>
          )}
        </div>

        {isBusiness && showAddMilestone && id && (
          <div className="px-6 pb-4">
            <AddMilestoneForm projectId={id} onDone={() => setShowAddMilestone(false)} />
          </div>
        )}

        {milestonesQuery.isLoading && <p className="px-6 pb-6 text-sm text-slate-400">Loading milestones…</p>}

        {milestonesQuery.data && milestones.length === 0 && (
          <div className="px-6 pb-6">
            <EmptyState
              title="No milestones yet."
              description={
                isBusiness
                  ? 'Break this project into milestones so payments and progress are clear.'
                  : 'The business hasn\'t added any milestones yet.'
              }
            />
          </div>
        )}

        {milestones.length > 0 && id && (
          <div className="border-t border-slate-200">
            {milestones.map((milestone, index) => (
              <MilestoneRow
                key={milestone._id}
                milestone={milestone}
                index={index}
                isBusiness={isBusiness}
                isDeveloper={isDeveloper}
                projectId={id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
