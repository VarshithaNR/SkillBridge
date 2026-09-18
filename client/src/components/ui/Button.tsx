import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
  secondary: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:text-indigo-300',
  outline:
    'bg-white text-slate-900 border border-slate-200 hover:border-indigo-600 hover:bg-slate-50 disabled:text-slate-300',
  destructive: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-200',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'rounded px-3.5 py-2 text-xs',
  md: 'rounded-md px-[18px] py-2.5 text-sm',
  lg: 'rounded-lg px-6 py-3.5 text-base',
};

/** SkillBridge reusable Button (Figma: Component Masters / Button). */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
        {...rest}
      >
        {loading && (
          <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
