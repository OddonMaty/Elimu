import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
  readonly options: (SelectOption | string)[];
  readonly error?: string;
  readonly helperText?: string;
  readonly fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  fullWidth = true,
  className,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={clsx('flex flex-col gap-1', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={twMerge(
            clsx(
              'h-10 px-3 py-2 pr-10 bg-surface-container-lowest border rounded text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none disabled:bg-surface-container disabled:cursor-not-allowed',
              error ? 'border-error focus:border-error focus:ring-error' : 'border-outline-variant',
              fullWidth && 'w-full',
              className
            )
          )}
          {...props}
        >
          {options.map((opt, idx) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lbl = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={idx} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">
          expand_more
        </span>
      </div>
      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-on-surface-variant mt-0.5">{helperText}</p>}
    </div>
  );
};
