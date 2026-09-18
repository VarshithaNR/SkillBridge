import type { ReactNode } from 'react';

interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-10 text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h5l2 2h11v10H3z" />
    <path strokeLinecap="round" d="M12 12v5M9.5 14.5h5" />
  </svg>
);

/** SkillBridge reusable Empty State (Figma: Component Masters / Empty State). */
export function EmptyState({ eyebrow, title, description, action, icon, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-10 text-center ${className}`}
    >
      {eyebrow && <p className="text-[11px] font-bold text-slate-500 uppercase">{eyebrow}</p>}
      {icon ?? DEFAULT_ICON}
      <p className="font-display text-base font-bold text-slate-900">{title}</p>
      {description && <p className="max-w-[300px] text-[13px] text-slate-500">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
