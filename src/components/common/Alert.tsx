import React from 'react';
import { clsx } from 'clsx';

export interface AlertProps {
  readonly type?: 'info' | 'success' | 'warning' | 'error';
  readonly title?: string;
  readonly children: React.ReactNode;
  readonly icon?: string;
  readonly onClose?: () => void;
  readonly className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  icon,
  onClose,
  className
}) => {
  const styles = {
    info: 'bg-primary-fixed/40 border-primary-fixed text-primary',
    success: 'bg-[#e6f4ea] border-[#ceead6] text-[#0d5223]',
    warning: 'bg-[#fff0db] border-[#ffdcbe] text-[#8b5000]',
    error: 'bg-[#ffdad6] border-[#ffb4ab] text-[#ba1a1a]'
  };

  const defaultIcons = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error'
  };

  return (
    <div
      className={clsx(
        'p-4 rounded-lg border flex items-start gap-3 text-sm',
        styles[type],
        className
      )}
    >
      <span className="material-symbols-outlined text-xl leading-none flex-shrink-0 mt-0.5">
        {icon || defaultIcons[type]}
      </span>
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div className="text-xs sm:text-sm leading-relaxed opacity-95">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="opacity-70 hover:opacity-100 p-0.5 rounded transition-opacity"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      )}
    </div>
  );
};
