import React from 'react';

export interface LoadingSpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface-variant">
      <span className={`material-symbols-outlined animate-spin text-primary ${sizeClasses[size]}`}>
        progress_activity
      </span>
      {message && <p className="text-xs sm:text-sm mt-3 font-medium text-on-surface-variant">{message}</p>}
    </div>
  );
};
