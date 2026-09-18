import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

/** SkillBridge reusable Select (Figma: Component Masters / Form Field, Type=Select). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = '', children, ...rest }, ref) => {
    const fieldId = id ?? rest.name;
    return (
      <div>
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-xs font-bold text-slate-700 uppercase">
            {label}
          </label>
        )}
        <div className={`relative rounded-md border bg-white ${error ? 'border-red-500' : 'border-slate-200'}`}>
          <select
            ref={ref}
            id={fieldId}
            className={`w-full appearance-none bg-transparent p-3 pr-9 text-sm text-slate-900 outline-none ${className}`}
            {...rest}
          >
            {children}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-slate-500"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
