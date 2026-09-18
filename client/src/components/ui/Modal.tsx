import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** SkillBridge reusable Modal/Popover dialog (Figma: Component Masters / Modal). */
export function Modal({ open, onClose, eyebrow, title, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {eyebrow && <p className="text-[11px] font-bold text-slate-500 uppercase">{eyebrow}</p>}
            <p className="font-display text-lg font-extrabold text-slate-900">{title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-[13px] text-slate-500">{children}</div>

        {footer && <div className="flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
