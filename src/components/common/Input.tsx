import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
  readonly icon?: string; // Material symbol name
  readonly iconPosition?: 'left' | 'right';
  readonly fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={clsx('flex flex-col gap-1', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && iconPosition === 'left' && (
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-xl pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'h-10 px-3 py-2 bg-surface-container-lowest border rounded text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:bg-surface-container disabled:cursor-not-allowed',
              error ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant',
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              fullWidth && 'w-full',
              className
            )
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="material-symbols-outlined absolute right-3 text-on-surface-variant text-xl pointer-events-none">
            {icon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-on-surface-variant mt-0.5">{helperText}</p>}
    </div>
  );
};
