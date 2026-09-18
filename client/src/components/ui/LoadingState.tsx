interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** SkillBridge reusable Loading State (Figma: Component Masters / Loading State). */
export function LoadingState({ label = 'Loading…', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}>
      <svg className="size-6 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
      </svg>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
