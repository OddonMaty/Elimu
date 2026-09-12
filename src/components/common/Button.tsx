import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly icon?: string; // Material symbol name
  readonly iconPosition?: 'left' | 'right';
  readonly isLoading?: boolean;
  readonly fullWidth?: boolean;
  readonly children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed rounded';

  const variantStyles = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container focus:ring-primary',
    secondary: 'bg-surface-container text-on-surface hover:bg-surface-container-high focus:ring-primary',
    accent: 'bg-secondary-container text-primary font-semibold hover:bg-[#e08a22] focus:ring-secondary-container shadow-sm',
    outline: 'border border-outline-variant text-on-surface hover:bg-surface-container-low focus:ring-primary',
    ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus:ring-primary',
    danger: 'bg-error text-on-error hover:bg-[#93000a] focus:ring-error',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-lg leading-none">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-lg leading-none">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};
