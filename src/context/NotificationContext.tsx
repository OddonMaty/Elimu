import React, { createContext, useContext, useState } from 'react';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: ToastNotification[];
  notify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const notify = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastNotification = { id, type, title, message };
    setNotifications(prev => [...prev, newToast]);

    setTimeout(() => {
      dismiss(id);
    }, 4500);
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
      {/* Floating toast stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-lg shadow-lg border flex items-start justify-between gap-3 transform transition-all duration-300 animate-slide-up ${
              n.type === 'success' ? 'bg-[#e6f4ea] border-[#ceead6] text-[#0d5223]' :
              n.type === 'error' ? 'bg-[#ffdad6] border-[#ffb4ab] text-[#ba1a1a]' :
              n.type === 'warning' ? 'bg-[#fff0db] border-[#ffdcbe] text-[#8b5000]' :
              'bg-[#eef1f4] border-[#c3c6cf] text-[#002547]'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-xl mt-0.5">
                {n.type === 'success' ? 'check_circle' : n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : 'info'}
              </span>
              <div>
                <h4 className="font-semibold text-sm">{n.title}</h4>
                <p className="text-xs mt-0.5 opacity-90">{n.message}</p>
              </div>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="text-gray-500 hover:text-gray-800 p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
