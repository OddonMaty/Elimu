import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  readonly children: React.ReactNode;
  readonly variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';
  readonly size?: 'sm' | 'md';
  readonly dot?: boolean;
  readonly icon?: string;
  readonly className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className
}) => {
  const variantStyles = {
    success: 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]',
    warning: 'bg-[#fff0db] text-[#8b5000] border border-[#ffdcbe]',
    error: 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]',
    info: 'bg-primary-fixed text-primary border border-primary-fixed-dim',
    primary: 'bg-primary text-on-primary',
    neutral: 'bg-surface-container text-on-surface-variant border border-outline-variant'
  };

  const dotColors = {
    success: 'bg-[#137333]',
    warning: 'bg-[#8b5000]',
    error: 'bg-[#ba1a1a]',
    info: 'bg-primary',
    primary: 'bg-white',
    neutral: 'bg-on-surface-variant'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5'
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full leading-none whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {icon && <span className="material-symbols-outlined text-sm leading-none">{icon}</span>}
      {children}
    </span>
  );
};
