import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly title?: string;
  readonly subtitle?: string;
  readonly action?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly noPadding?: boolean;
  readonly variant?: 'default' | 'flat' | 'highlight' | 'navy';
  readonly children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  variant = 'default',
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-surface-container-lowest border border-outline-variant rounded-lg',
    flat: 'bg-surface-container-low border border-outline-variant/60 rounded-lg',
    highlight: 'bg-surface-container-lowest border-l-4 border-l-secondary-container border-y border-r border-outline-variant rounded-lg shadow-sm',
    navy: 'bg-primary-container text-white border border-primary rounded-lg'
  };

  return (
    <div
      className={twMerge(
        clsx(
          'transition-shadow overflow-hidden',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/50">
          <div>
            {title && (
              <h3 className={clsx('text-base font-semibold', variant === 'navy' ? 'text-white' : 'text-on-surface')}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={clsx('text-xs mt-0.5', variant === 'navy' ? 'text-on-primary-container' : 'text-on-surface-variant')}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3 bg-surface-container-low/50 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant">
          {footer}
        </div>
      )}
    </div>
  );
};
