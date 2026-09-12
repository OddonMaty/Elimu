import React from 'react';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
}

export interface TabsProps {
  readonly tabs: TabItem[];
  readonly activeTab: string;
  readonly onChange: (id: string) => void;
  readonly variant?: 'line' | 'pills' | 'enclosed';
  readonly className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  className
}) => {
  return (
    <div
      className={clsx(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'line' && 'border-b border-outline-variant',
        variant === 'enclosed' && 'bg-surface-container-low p-1 rounded-lg border border-outline-variant',
        className
      )}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-150',
              variant === 'line' && [
                'border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              ],
              variant === 'pills' && [
                'rounded-full',
                isActive
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-transparent text-on-surface-variant hover:bg-surface-container'
              ],
              variant === 'enclosed' && [
                'rounded-md',
                isActive
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              ]
            )}
          >
            {tab.icon && (
              <span className="material-symbols-outlined text-lg leading-none">{tab.icon}</span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none',
                  isActive
                    ? 'bg-primary-fixed text-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
