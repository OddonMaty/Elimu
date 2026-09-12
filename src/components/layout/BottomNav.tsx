import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

export interface BottomNavProps {
  readonly className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const { currentUser } = useAuth();

  const getNavLinks = () => {
    switch (currentUser.role) {
      case 'parent':
        return [
          { to: '/parent', label: 'Accueil', icon: 'home' },
          { to: '/parent/grades', label: 'Notes', icon: 'grade' },
          { to: '/parent/absences', label: 'Absences', icon: 'event_busy' },
          { to: '/parent/homework', label: 'Devoirs', icon: 'menu_book' },
          { to: '/parent/finances', label: 'Finances', icon: 'payments' },
        ];
      case 'teacher':
        return [
          { to: '/teacher/attendance', label: 'Appel', icon: 'fact_check' },
          { to: '/teacher/grades', label: 'Notes', icon: 'edit_note' },
          { to: '/teacher/homework', label: 'Devoirs', icon: 'assignment' },
          { to: '/teacher/schedule', label: 'Horaire', icon: 'calendar_today' },
        ];
      case 'secretariat':
        return [
          { to: '/secretariat/students', label: 'Élèves', icon: 'folder_shared' },
          { to: '/secretariat/enrollment', label: 'Inscrire', icon: 'person_add' },
          { to: '/secretariat/id-cards', label: 'Cartes', icon: 'badge' },
          { to: '/secretariat/tuition', label: 'Frais', icon: 'receipt_long' },
        ];
      default:
        return [
          { to: '/direction', label: 'Direction', icon: 'dashboard' },
          { to: '/direction/applications', label: 'Dossiers', icon: 'how_to_reg' },
          { to: '/secretariat/students', label: 'Élèves', icon: 'folder_shared' },
          { to: '/finance', label: 'Finance', icon: 'account_balance_wallet' },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <div className={clsx('lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/70 shadow-lg px-2 py-1.5 flex items-center justify-around', className)}>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/direction' || link.to === '/parent'}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors flex-1',
              isActive
                ? 'text-primary font-bold bg-primary-fixed/30'
                : 'text-on-surface-variant hover:text-on-surface'
            )
          }
        >
          <span className="material-symbols-outlined text-22px mb-0.5">{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
