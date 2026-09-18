export type BadgeTone = 'success' | 'warning' | 'error' | 'active' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const TONE_STYLES: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-500',
  warning: 'bg-amber-100 text-amber-500',
  error: 'bg-red-50 text-red-500',
  active: 'bg-indigo-50 text-indigo-600',
  neutral: 'bg-slate-100 text-slate-500',
};

/** SkillBridge reusable Status Badge (Figma: Component Masters / Status Badge). */
export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold whitespace-nowrap ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
