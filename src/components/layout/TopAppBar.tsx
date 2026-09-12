import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CURRENT_ACADEMIC_YEAR } from '../../data/mockData';

export interface TopAppBarProps {
  readonly onToggleSidebar?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname === '/direction') return 'Tableau de Bord Direction';
    if (pathname.includes('/direction/applications')) return 'Gestion des Candidatures & Inscriptions';
    if (pathname.includes('/direction/classes')) return 'Configuration des Classes & Sections';
    if (pathname.includes('/direction/options')) return 'Options & Filières Homologuées';
    if (pathname.includes('/direction/schedules')) return 'Gestion des Horaires & Emploi du Temps';
    if (pathname.includes('/direction/settings')) return 'Paramètres de l’Établissement';
    if (pathname.includes('/direction/notifications')) return 'Configuration des Notifications Parents';
    
    if (pathname.includes('/secretariat/students')) return 'Registre Matricule des Élèves';
    if (pathname.includes('/secretariat/enrollment')) return 'Nouvelle Inscription Scolaire';
    if (pathname.includes('/secretariat/id-cards')) return 'Génération des Cartes d’Identité Scolaires';
    if (pathname.includes('/secretariat/tuition')) return 'Suivi des Frais & Caisse Scolaire';

    if (pathname.includes('/teacher/attendance')) return 'Appel de Présence Journalier';
    if (pathname.includes('/teacher/grades')) return 'Saisie des Notes & Évaluations';
    if (pathname.includes('/teacher/homework/new')) return 'Création d’un Nouveau Devoir';
    if (pathname.includes('/teacher/homework')) return 'Gestion & Suivi des Devoirs';
    if (pathname.includes('/teacher/schedule')) return 'Mon Emploi du Temps';

    if (pathname === '/parent') return 'Espace Parent - Tableau de Bord';
    if (pathname.includes('/parent/grades')) return 'Notes & Performances de l’Élève';
    if (pathname.includes('/parent/bulletin/official')) return 'Bulletin Scolaire Officiel EPST-RDC';
    if (pathname.includes('/parent/absences/justify')) return 'Soumission de Justificatif d’Absence';
    if (pathname.includes('/parent/absences')) return 'Assiduité & Historique des Absences';
    if (pathname.includes('/parent/homework')) return 'Cahier de Textes & Devoirs';
    if (pathname.includes('/parent/messages')) return 'Messagerie Directe Établissement';
    if (pathname.includes('/parent/finances/receipt')) return 'Reçu de Paiement Numérique';
    if (pathname.includes('/parent/finances')) return 'État Financier & Paiement des Frais';

    if (pathname === '/finance') return 'Tableau de Bord Facturation & Recouvrement';
    if (pathname.includes('/finance/config')) return 'Paramétrage des Frais Scolaires';
    
    if (pathname === '/admin') return 'Super-Admin SAO Tech Agency';
    if (pathname.includes('/admin/plan')) return 'Gestion des Abonnements SaaS';

    return 'Elimu School Manager';
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant/60 shadow-sm">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Logo / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Ouvrir le menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <Link to="/schools" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-secondary-container font-black text-lg shadow-sm">
              E
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base text-primary tracking-tight">ELIMU</span>
              <span className="text-[10px] block text-on-surface-variant font-medium -mt-1 uppercase tracking-wider">
                RDC School Cloud
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-outline-variant/60">
            <span className="text-sm font-semibold text-on-surface">{getPageTitle(location.pathname)}</span>
          </div>
        </div>

        {/* Center spacing */}
        <div className="hidden xl:block flex-1">
        </div>

        {/* Right Section: School Badge, Year, Alerts, User Avatar */}
        <div className="flex items-center gap-3">
          {currentUser.schoolName && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-outline-variant rounded-md text-xs font-semibold text-primary">
              <span className="material-symbols-outlined text-base text-secondary-container">account_balance</span>
              <span>{currentUser.schoolName}</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-primary/5 text-primary rounded-md text-xs font-bold border border-primary/10">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span>{CURRENT_ACADEMIC_YEAR}</span>
          </div>

          <Link
            to={currentUser.role === 'parent' ? '/parent/messages' : '/direction/notifications'}
            className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-container rounded-full ring-2 ring-white"></span>
          </Link>

          {/* User dropdown/avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/60">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-outline-variant"
            />
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-on-surface leading-tight">{currentUser.name}</p>
              <p className="text-[11px] text-on-surface-variant capitalize">{currentUser.role}</p>
            </div>
            <Link
              to="/login"
              onClick={logout}
              className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors ml-1"
              title="Déconnexion"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
