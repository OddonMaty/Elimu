import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

export interface RoleSwitcherProps {
  readonly className?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ className }) => {
  const { currentUser, setRole } = useAuth();
  const navigate = useNavigate();

  const roles: { role: UserRole; label: string; icon: string; defaultRoute: string }[] = [
    { role: 'direction', label: 'Direction', icon: 'admin_panel_settings', defaultRoute: '/direction' },
    { role: 'secretariat', label: 'Secrétariat', icon: 'badge', defaultRoute: '/secretariat/students' },
    { role: 'teacher', label: 'Enseignant', icon: 'school', defaultRoute: '/teacher/attendance' },
    { role: 'parent', label: 'Espace Parent', icon: 'family_restroom', defaultRoute: '/parent' },
    { role: 'superadmin', label: 'Super-Admin', icon: 'shield_person', defaultRoute: '/admin' },
    { role: 'guest', label: 'Portail Public', icon: 'public', defaultRoute: '/schools' },
  ];

  const handleSwitch = (newRole: UserRole, route: string) => {
    setRole(newRole);
    navigate(route);
  };

  return (
    <div className={`flex items-center gap-1 bg-primary/95 text-white p-1 rounded-lg text-xs shadow-inner border border-primary-container ${className || ''}`}>
      <span className="text-[11px] font-semibold text-on-primary-container px-2 hidden lg:inline">
        Rôle Actif:
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {roles.map(r => {
          const isActive = currentUser.role === r.role;
          return (
            <button
              key={r.role}
              onClick={() => handleSwitch(r.role, r.defaultRoute)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium text-xs ${
                isActive
                  ? 'bg-secondary-container text-primary font-bold shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              title={`Basculer en ${r.label}`}
            >
              <span className="material-symbols-outlined text-sm leading-none">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
