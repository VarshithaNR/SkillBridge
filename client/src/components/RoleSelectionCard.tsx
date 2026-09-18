import type { ReactNode } from 'react';

interface RoleSelectionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

/** One of the two public-signup role cards (Developer / Business). Admin is never offered here. */
export function RoleSelectionCard({
  icon,
  title,
  description,
  selected,
  onSelect,
}: RoleSelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex w-full flex-col items-start gap-3 rounded-xl border-2 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
        selected
          ? 'border-indigo-600 bg-indigo-50/60 shadow-md'
          : 'border-slate-200 bg-white hover:border-indigo-300'
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl transition-colors ${
          selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100'
        }`}
      >
        {icon}
      </span>
      <span className="text-base font-semibold text-slate-900">{title}</span>
      <span className="text-sm leading-relaxed text-slate-500">{description}</span>
    </button>
  );
}
