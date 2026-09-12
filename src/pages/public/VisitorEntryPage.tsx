import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NavigationTransition } from '../../components/common/NavigationTransition';

export interface VisitorEntryPageProps {}

interface EntryCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaIcon: string;
  href: string;
  variant: 'parent' | 'connected' | 'school';
  /** Icon shown on the transition screen */
  transitionIcon: string;
  /** Contextual loading message */
  transitionMessage: string;
  /** Accent color for transition overlay */
  transitionAccent: '#fda13a' | '#88a6cf' | '#ffffff';
}

const ENTRY_CARDS: EntryCard[] = [
  {
    id: 'visitor',
    icon: 'manage_search',
    title: 'Je cherche une école',
    subtitle: 'Visiteur & Familles',
    description:
      "Parcourez l'annuaire des écoles, comparez les établissements et inscrivez votre enfant en ligne. Aucun compte requis.",
    ctaLabel: 'Explorer les Écoles',
    ctaIcon: 'school',
    href: '/schools',
    variant: 'parent',
    transitionIcon: 'travel_explore',
    transitionMessage: "Préparation de l'annuaire des écoles RDC...",
    transitionAccent: '#fda13a',
  },
  {
    id: 'parent',
    icon: 'account_circle',
    title: 'Espace Parent',
    subtitle: 'Compte existant',
    description:
      'Votre enfant est déjà inscrit dans une école Elimu ? Connectez-vous pour suivre ses résultats, absences et paiements.',
    ctaLabel: 'Se Connecter',
    ctaIcon: 'login',
    href: '/login?type=parent',
    variant: 'connected',
    transitionIcon: 'family_restroom',
    transitionMessage: "Ouverture de votre espace parent...",
    transitionAccent: '#88a6cf',
  },
  {
    id: 'school',
    icon: 'account_balance',
    title: 'Mon École',
    subtitle: 'Établissements Scolaires',
    description:
      "Rejoignez le réseau Elimu RDC, découvrez notre offre tarifaire et digitalisez la gestion de votre établissement.",
    ctaLabel: "Découvrir l'Offre",
    ctaIcon: 'arrow_forward',
    href: '/onboarding',
    variant: 'school',
    transitionIcon: 'account_balance',
    transitionMessage: "Préparation de votre espace établissement...",
    transitionAccent: '#fda13a',
  },
];

// ── Transition state ───────────────────────────────────────────────────────────
interface ActiveTransition {
  icon: string;
  message: string;
  href: string;
  accent: '#fda13a' | '#88a6cf' | '#ffffff';
}

export const VisitorEntryPage: React.FC<VisitorEntryPageProps> = () => {
  const [transition, setTransition] = useState<ActiveTransition | null>(null);

  const handleCardClick = (card: EntryCard) => {
    setTransition({
      icon: card.transitionIcon,
      message: card.transitionMessage,
      href: card.href,
      accent: card.transitionAccent,
    });
  };

  return (
    <div className="min-h-screen bg-[#002547] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* ── Transition overlay (mounts only when a card is clicked) ── */}
      {transition && (
        <NavigationTransition
          icon={transition.icon}
          message={transition.message}
          href={transition.href}
          accentColor={transition.accent}
          onDone={() => setTransition(null)}
        />
      )}

      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1b3b5f] opacity-60 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-[#032641] opacity-50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#fda13a] opacity-[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-10">
        {/* Logo & headline */}
        <div className="text-center space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group"
            aria-label="Accueil Elimu"
          >
            <div className="w-14 h-14 rounded-xl bg-[#fda13a] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-[#002547] font-black text-3xl leading-none select-none">E</span>
            </div>
            <div className="text-left">
              <p className="text-white font-black text-3xl tracking-tight leading-none">ELIMU</p>
              <p className="text-[#88a6cf] text-[11px] font-semibold uppercase tracking-widest mt-0.5">
                EduRDC • Gestion Scolaire
              </p>
            </div>
          </Link>

          <div className="space-y-2">
            <h1 className="text-white font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
              Bienvenue sur la plateforme scolaire<br className="hidden sm:block" /> nationale de la RDC
            </h1>
            <p className="text-[#88a6cf] text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Choisissez votre profil pour accéder à l'espace qui vous correspond.
            </p>
          </div>
        </div>

        {/* Entry cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {ENTRY_CARDS.map((card) => (
            <button
              key={card.id}
              id={`entry-card-${card.id}`}
              type="button"
              onClick={() => handleCardClick(card)}
              disabled={!!transition}
              className={`
                group relative flex flex-col items-start text-left w-full
                rounded-2xl border transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fda13a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#002547]
                disabled:pointer-events-none disabled:opacity-60
                ${
                  card.variant === 'parent'
                    ? 'bg-white/[0.06] border-white/10 hover:bg-white/[0.11] hover:border-[#fda13a]/40 hover:shadow-[0_0_40px_rgba(253,161,58,0.12)]'
                    : card.variant === 'connected'
                    ? 'bg-[#1b3b5f]/40 border-[#88a6cf]/20 hover:bg-[#1b3b5f]/70 hover:border-[#88a6cf]/50 hover:shadow-[0_0_40px_rgba(136,166,207,0.12)]'
                    : 'bg-[#032641]/70 border-[#1b3b5f] hover:bg-[#032641]/90 hover:border-[#fda13a]/30 hover:shadow-[0_0_40px_rgba(253,161,58,0.08)]'
                }
                p-6 sm:p-8
              `}
              aria-label={card.title}
            >
              {/* Subtle corner accent */}
              <div
                aria-hidden="true"
                className={`absolute top-0 right-0 w-24 h-24 rounded-2xl overflow-hidden pointer-events-none`}
              >
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 ${
                    card.variant === 'parent'
                      ? 'bg-[#fda13a]'
                      : card.variant === 'connected'
                      ? 'bg-[#88a6cf]'
                      : 'bg-[#fda13a]'
                  }`}
                />
              </div>

              {/* Icon badge */}
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-md
                  transition-transform duration-200 group-hover:scale-110
                  ${
                    card.variant === 'parent'
                      ? 'bg-[#fda13a]'
                      : card.variant === 'connected'
                      ? 'bg-[#1b3b5f] border border-[#88a6cf]/40'
                      : 'bg-[#002547] border border-[#fda13a]/20'
                  }
                `}
              >
                <span
                  className={`material-symbols-outlined text-3xl ${
                    card.variant === 'parent'
                      ? 'text-[#002547]'
                      : card.variant === 'connected'
                      ? 'text-[#88a6cf]'
                      : 'text-[#fda13a]'
                  }`}
                >
                  {card.icon}
                </span>
              </div>

              {/* Label chip */}
              <span
                className={`
                  inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3
                  ${
                    card.variant === 'parent'
                      ? 'bg-[#fda13a]/20 text-[#fda13a]'
                      : card.variant === 'connected'
                      ? 'bg-[#88a6cf]/15 text-[#88a6cf]'
                      : 'bg-[#fda13a]/10 text-[#fda13a]/80'
                  }
                `}
              >
                {card.subtitle}
              </span>

              {/* Title */}
              <h2 className="text-white font-bold text-xl sm:text-2xl leading-tight mb-2">
                {card.title}
              </h2>

              {/* Description */}
              <p className="text-[#88a6cf] text-sm leading-relaxed flex-1 mb-6">
                {card.description}
              </p>

              {/* CTA row */}
              <div
                className={`
                  inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold
                  transition-all duration-200 group-hover:gap-3
                  ${
                    card.variant === 'parent'
                      ? 'bg-[#fda13a] text-[#002547]'
                      : card.variant === 'connected'
                      ? 'bg-[#1b3b5f] text-white border border-[#88a6cf]/30 group-hover:bg-[#002547]'
                      : 'bg-[#fda13a]/15 text-[#fda13a] border border-[#fda13a]/30 group-hover:bg-[#fda13a]/25'
                  }
                `}
              >
                <span className="material-symbols-outlined text-base">{card.ctaIcon}</span>
                <span>{card.ctaLabel}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer micro-text */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-[#88a6cf] text-xs text-center">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#fda13a]">verified</span>
            Conforme aux normes du Ministère de l'EPST
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span>© 2026 Elimu RDC • SAO Tech Agency</span>
        </div>
      </div>
    </div>
  );
};
