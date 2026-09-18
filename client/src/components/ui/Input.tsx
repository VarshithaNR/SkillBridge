import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

/** SkillBridge reusable text Input (Figma: Component Masters / Form Field, Type=Text). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, id, className = '', ...rest }, ref) => {
    const fieldId = id ?? rest.name;
    return (
      <div>
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-xs font-bold text-slate-700 uppercase">
            {label}
          </label>
        )}
        <div
          className={`flex items-center gap-2 rounded-md border bg-white p-3 focus-within:border-indigo-600 ${
            error ? 'border-red-500' : 'border-slate-200'
          }`}
        >
          {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
          <input
            ref={ref}
            id={fieldId}
            className={`w-full min-w-0 flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 ${className}`}
            {...rest}
          />
        </div>
        {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
