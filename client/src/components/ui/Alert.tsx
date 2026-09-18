export type AlertTone = 'success' | 'warning';

interface AlertProps {
  title: string;
  message: string;
  tone?: AlertTone;
  className?: string;
}

const TONE_STYLES: Record<AlertTone, { border: string; bg: string; title: string }> = {
  success: { border: 'border-emerald-500', bg: 'bg-emerald-50', title: 'text-emerald-500' },
  warning: { border: 'border-amber-500', bg: 'bg-amber-100', title: 'text-amber-500' },
};

const ICONS: Record<AlertTone, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-[18px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-[18px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.9 2 18a1.5 1.5 0 0 0 1.3 2.3h17.4A1.5 1.5 0 0 0 22 18L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" />
      <path strokeLinecap="round" d="M12 9v4M12 17h.01" />
    </svg>
  ),
};

/** SkillBridge reusable Alert (Figma: Component Masters / Alert). */
export function Alert({ title, message, tone = 'success', className = '' }: AlertProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${styles.border} ${styles.bg} ${className}`}
    >
      <div className={styles.title}>{ICONS[tone]}</div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className={`text-sm font-bold ${styles.title}`}>{title}</p>
        <p className="text-[13px] text-slate-900">{message}</p>
      </div>
    </div>
  );
}
