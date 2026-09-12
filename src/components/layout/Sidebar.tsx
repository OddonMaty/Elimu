import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

export interface SidebarProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

interface NavSection {
  title?: string;
  items: {
    label: string;
    to: string;
    icon: string;
    badge?: string | number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();

  const getNavSections = (): NavSection[] => {
    switch (currentUser.role) {
      case 'direction':
        return [
          {
            title: 'PILOTAGE STRATÉGIQUE',
            items: [
              { label: 'Tableau de Bord', to: '/direction', icon: 'dashboard' },
              { label: 'Messagerie Interne', to: '/direction/messages', icon: 'chat', badge: '1' },
              { label: 'Candidatures & Inscriptions', to: '/direction/applications', icon: 'how_to_reg', badge: '3' },
              { label: 'Classes & Sections', to: '/direction/classes', icon: 'groups' },
              { label: 'Options & Filières', to: '/direction/options', icon: 'account_tree' },
              { label: 'Gestion des Horaires', to: '/direction/schedules', icon: 'schedule' },
            ]
          },
          {
            title: 'FINANCE & COMPTABILITÉ',
            items: [
              { label: 'Facturation & Trésorerie', to: '/finance', icon: 'account_balance_wallet' },
              { label: 'Configuration des Frais', to: '/finance/config', icon: 'payments' },
              { label: 'Registre des Paiements', to: '/secretariat/tuition', icon: 'receipt_long' },
            ]
          },
          {
            title: 'CONFIGURATION ÉCOLE',
            items: [
              { label: 'Mon Équipe', to: '/direction/team', icon: 'manage_accounts' },
              { label: 'Notifications SMS/WhatsApp', to: '/direction/notifications', icon: 'sms' },
              { label: 'Paramètres Généraux', to: '/direction/settings', icon: 'settings' },
              { label: 'Mon Abonnement SaaS', to: '/admin/plan', icon: 'loyalty' },
            ]
          }
        ];

      case 'secretariat':
        return [
          {
            title: 'SCOLARITÉ & MATRICULE',
            items: [
              { label: 'Registre des Élèves', to: '/secretariat/students', icon: 'folder_shared' },
              { label: 'Nouvelle Inscription', to: '/secretariat/enrollment', icon: 'person_add' },
              { label: 'Cartes d’Identité Élèves', to: '/secretariat/id-cards', icon: 'badge' },
              { label: 'Répartition des Classes', to: '/direction/classes', icon: 'meeting_room' },
            ]
          },
          {
            title: 'CAISSE & JUSTIFICATIFS',
            items: [
              { label: 'Dossiers d’Inscription', to: '/direction/applications', icon: 'assignment' },
            ]
          }
        ];

      case 'tresorerie':
        return [
          {
            title: 'FINANCE & COMPTABILITÉ',
            items: [
              { label: 'Facturation & Trésorerie', to: '/finance', icon: 'account_balance_wallet' },
              { label: 'Configuration des Frais', to: '/finance/config', icon: 'payments' },
              { label: 'Suivi des Paiements', to: '/finance/tuition', icon: 'receipt_long' },
            ]
          }
        ];

      case 'proviseur':
        return [
          {
            title: 'GESTION ACADÉMIQUE',
            items: [
              { label: 'Corps Professoral', to: '/proviseur', icon: 'diversity_3' },
              { label: 'Classes & Sections', to: '/direction/classes', icon: 'groups' },
              { label: 'Gestion des Horaires', to: '/direction/schedules', icon: 'schedule' },
            ]
          }
        ];

      case 'teacher':
        return [
          {
            title: 'GESTION DE CLASSE',
            items: [
              { label: 'Appel de Présence', to: '/teacher/attendance', icon: 'fact_check' },
              { label: 'Saisie des Notes', to: '/teacher/grades', icon: 'edit_note' },
              { label: 'Cahier de Devoirs', to: '/teacher/homework', icon: 'assignment' },
              { label: 'Créer un Devoir', to: '/teacher/homework/new', icon: 'add_task' },
              { label: 'Mon Emploi du Temps', to: '/teacher/schedule', icon: 'calendar_today' },
            ]
          },
          {
            title: 'BULLETINS & CONSEIL',
            items: [
              { label: 'Aperçu des Notes', to: '/parent/grades', icon: 'grade' },
              { label: 'Bulletin Ministériel RDC', to: '/parent/bulletin/official', icon: 'verified' },
            ]
          }
        ];

      case 'parent':
        return [
          {
            title: 'SUIVI DES ENFANTS',
            items: [
              { label: 'Tableau de Bord', to: '/parent', icon: 'home' },
              { label: 'Notes & Résultats', to: '/parent/grades', icon: 'grade' },
              { label: 'Bulletin Officiel RDC', to: '/parent/bulletin/official', icon: 'verified' },
              { label: 'Suivi des Absences', to: '/parent/absences', icon: 'event_busy' },
              { label: 'Devoirs & Leçons', to: '/parent/homework', icon: 'menu_book' },
            ]
          },
          {
            title: 'FINANCES & CONTACT',
            items: [
              { label: 'Paiement des Frais', to: '/parent/finances', icon: 'credit_card', badge: 'À payer' },
              { label: 'Messagerie Enseignants', to: '/parent/messages', icon: 'chat', badge: '1' },
            ]
          }
        ];

      case 'superadmin':
        return [
          {
            title: 'PLATEFORME NATIONALE',
            items: [
              { label: 'Super-Admin Dashboard', to: '/admin', icon: 'monitoring' },
              { label: 'Abonnements & Licences', to: '/admin/plan', icon: 'credit_card' },
              { label: 'Annuaire Public Écoles', to: '/schools', icon: 'travel_explore' },
            ]
          }
        ];

      default:
        return [
          {
            title: 'PORTAIL PUBLIC',
            items: [
              { label: 'Annuaire des Écoles', to: '/schools', icon: 'search' },
              { label: 'Comparateur d’Écoles', to: '/compare', icon: 'compare' },
              { label: 'Inscription en Ligne', to: '/register', icon: 'app_registration' },
              { label: 'Connexion Sécurisée', to: '/login', icon: 'login' },
            ]
          }
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-primary-container text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-primary shadow-lg',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-primary/40">
          <Link to="/schools" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-primary font-black text-xl shadow">
              E
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">ELIMU</span>
              <span className="text-[10px] block text-on-primary-container font-semibold -mt-1 tracking-widest uppercase">
                République Démocratique du Congo
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white p-1"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Institution banner */}
        <div className="px-5 py-3.5 bg-black/15 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-secondary-container/20 border border-secondary-container/30 flex items-center justify-center text-secondary-container">
            <span className="material-symbols-outlined text-lg">account_balance</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{currentUser.schoolName || 'Système Elimu RDC'}</p>
            <p className="text-[11px] text-on-primary-container truncate capitalize">{currentUser.role} • Kinshasa</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {sec.title && (
                <p className="px-3 text-[11px] font-bold tracking-wider text-on-primary-container/80 uppercase mb-2">
                  {sec.title}
                </p>
              )}
              {sec.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/direction' || item.to === '/parent' || item.to === '/admin' || item.to === '/finance'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-white text-primary font-bold shadow-sm'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <span
                          className={clsx(
                            'material-symbols-outlined text-xl transition-colors',
                            isActive ? 'text-primary' : 'text-on-primary-container group-hover:text-white'
                          )}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={clsx(
                            'text-[10px] px-2 py-0.5 rounded-full font-bold',
                            isActive
                              ? 'bg-primary text-white'
                              : 'bg-secondary-container text-primary font-extrabold'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer Quick Action / Public Portal Switch */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-2">
          <Link
            to="/register"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 bg-secondary-container text-primary font-bold text-xs rounded hover:bg-[#e08a22] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Nouvelle Inscription</span>
          </Link>

          <Link
            to="/schools"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 text-white/70 hover:text-white font-medium text-xs rounded hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">public</span>
            <span>Annuaire Public Écoles</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
