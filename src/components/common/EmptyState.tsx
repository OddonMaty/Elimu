import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  readonly icon?: string;
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg">
      <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant mb-4">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h4 className="text-base font-semibold text-on-surface">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
