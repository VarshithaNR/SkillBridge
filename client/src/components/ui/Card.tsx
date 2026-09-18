import type { HTMLAttributes } from 'react';

/** Shared surface container: white bg, slate-200 border, radius-xl. */
export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}
