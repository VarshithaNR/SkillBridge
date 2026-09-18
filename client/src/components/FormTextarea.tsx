import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, id, ...textareaProps }, ref) => {
    const fieldId = id ?? textareaProps.name;

    return (
      <div>
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          rows={4}
          className={`mt-1 block w-full resize-none rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            error ? 'border-red-400' : 'border-slate-300'
          }`}
          {...textareaProps}
        />
        {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
