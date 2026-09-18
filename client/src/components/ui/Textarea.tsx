import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** SkillBridge reusable Textarea (Figma: Component Masters / Form Field, Type=Textarea). */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className = '', rows = 4, ...rest }, ref) => {
    const fieldId = id ?? rest.name;
    return (
      <div>
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-xs font-bold text-slate-700 uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={`w-full resize-none rounded-md border bg-white p-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-600 ${
            error ? 'border-red-500' : 'border-slate-200'
          } ${className}`}
          {...rest}
        />
        {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
