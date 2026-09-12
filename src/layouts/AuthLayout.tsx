import React from 'react';
import { Outlet } from 'react-router-dom';

export interface AuthLayoutProps {
  readonly children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <Outlet />
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-on-surface-variant border-t border-outline-variant/40 bg-surface-container-low">
        <p>© 2026 Elimu RDC • Système Sécurisé de Gestion Scolaire</p>
      </footer>
    </div>
  );
};
