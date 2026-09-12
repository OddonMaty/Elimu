import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export interface PublicLayoutProps {
  readonly children?: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* Main Public Header */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/schools" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-secondary-container font-black text-2xl shadow">
              E
            </div>
            <div>
              <span className="font-extrabold text-xl text-primary tracking-tight">ELIMU</span>
              <span className="text-[11px] block text-on-surface-variant font-medium -mt-1 uppercase tracking-wider">
                EduRDC • Annuaire & Services Scolaires
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/schools"
              className={`hover:text-primary transition-colors ${
                location.pathname === '/schools' || location.pathname === '/' ? 'text-primary font-bold border-b-2 border-primary py-1' : 'text-on-surface-variant'
              }`}
            >
              Annuaire des Écoles
            </Link>
            <Link
              to="/compare"
              className={`hover:text-primary transition-colors ${
                location.pathname === '/compare' ? 'text-primary font-bold border-b-2 border-primary py-1' : 'text-on-surface-variant'
              }`}
            >
              Comparateur d’Écoles
            </Link>
            <Link
              to="/register"
              className={`hover:text-primary transition-colors ${
                location.pathname === '/register' ? 'text-primary font-bold border-b-2 border-primary py-1' : 'text-on-surface-variant'
              }`}
            >
              Inscription en Ligne
            </Link>

          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 text-sm font-semibold rounded transition-colors"
            >
              Espace Membre
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-secondary-container text-primary font-bold text-sm rounded hover:bg-[#e08a22] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-base">how_to_reg</span>
              <span>Inscrire un élève</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Official RDC Footer */}
      <footer className="bg-primary text-white border-t border-primary-container mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-primary font-black text-lg">
                E
              </div>
              <span className="font-bold text-lg text-white">ELIMU RDC</span>
            </div>
            <p className="text-xs text-on-primary-container leading-relaxed">
              Système intégré de gestion scolaire, inscription dématérialisée et suivi pédagogique pour les écoles et familles de la République Démocratique du Congo.
            </p>
            <div className="flex items-center gap-2 text-xs text-secondary-container font-semibold">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Conforme aux normes du Ministère de l'EPST</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Portail Public</h4>
            <ul className="space-y-2 text-xs text-on-primary-container">
              <li><Link to="/schools" className="hover:text-white transition-colors">Recherche & Annuaire des Écoles</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Comparateur des Frais & Options</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Dépôt de Candidature en Ligne</Link></li>

            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Espaces Métiers Sécurisés</h4>
            <ul className="space-y-2 text-xs text-on-primary-container">
              <li><Link to="/direction" className="hover:text-white transition-colors">Direction & Conseil de Gestion</Link></li>
              <li><Link to="/secretariat/students" className="hover:text-white transition-colors">Secrétariat & Matricule</Link></li>
              <li><Link to="/teacher/attendance" className="hover:text-white transition-colors">Enseignants & Saisie des Notes</Link></li>
              <li><Link to="/parent" className="hover:text-white transition-colors">Espace Parent & Bulletins</Link></li>
              <li><Link to="/finance" className="hover:text-white transition-colors">Comptabilité & Caisse</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Assistance & Support RDC</h4>
            <p className="text-xs text-on-primary-container leading-relaxed mb-3">
              Support technique disponible pour les directions d'écoles à Kinshasa, Lubumbashi, Goma et Matadi.
            </p>
            <div className="space-y-1.5 text-xs text-white">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary-container">call</span>
                <span>+243 81 000 3546</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary-container">mail</span>
                <span>support@elimu.cd</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary-container">location_on</span>
                <span>Boulevard du 30 Juin, Gombe, Kinshasa</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-on-primary-container gap-2">
          <p>© 2026 Elimu RDC • SAO Tech Agency. Tous droits réservés.</p>
          <p>Plateforme hébergée et certifiée conforme aux directives de l'Enseignement Primaire, Secondaire et Technique (EPST).</p>
        </div>
      </footer>
    </div>
  );
};
