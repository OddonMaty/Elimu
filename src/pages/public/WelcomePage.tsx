import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ── Animated background elements ────────────────────────────────────────────────
const FLOATING_ICONS = [
  // [x%, y%, size, duration, delay, opacity]
  { x: 8,  y: 75, size: 28, dur: 18, delay: 0,   op: 0.13, icon: 'book' },
  { x: 85, y: 80, size: 22, dur: 22, delay: 3,   op: 0.10, icon: 'cap' },
  { x: 20, y: 60, size: 18, dur: 15, delay: 6,   op: 0.12, icon: 'pencil' },
  { x: 70, y: 55, size: 26, dur: 20, delay: 1,   op: 0.09, icon: 'globe' },
  { x: 45, y: 85, size: 20, dur: 25, delay: 8,   op: 0.11, icon: 'bulb' },
  { x: 92, y: 40, size: 16, dur: 17, delay: 4,   op: 0.10, icon: 'star' },
  { x: 5,  y: 35, size: 24, dur: 23, delay: 11,  op: 0.08, icon: 'ruler' },
  { x: 58, y: 70, size: 19, dur: 19, delay: 7,   op: 0.12, icon: 'atom' },
] as const;

const SHAPES = [
  { x: 10, y: 20, size: 120, dur: 28, delay: 0,  op: 0.06, type: 'circle', color: '#fda13a' },
  { x: 80, y: 10, size: 90,  dur: 35, delay: 5,  op: 0.05, type: 'circle', color: '#ffffff' },
  { x: 55, y: 30, size: 70,  dur: 22, delay: 12, op: 0.04, type: 'hex',    color: '#fda13a' },
  { x: 25, y: 80, size: 100, dur: 32, delay: 3,  op: 0.05, type: 'circle', color: '#1b3b5f' },
  { x: 75, y: 65, size: 80,  dur: 26, delay: 9,  op: 0.06, type: 'hex',    color: '#ffffff' },
  { x: 40, y: 50, size: 60,  dur: 30, delay: 15, op: 0.04, type: 'circle', color: '#fda13a' },
] as const;

const PARTICLES = [
  { x: 15, y: 25, dur: 4,  delay: 0   },
  { x: 35, y: 60, dur: 5,  delay: 1.5 },
  { x: 60, y: 15, dur: 3.5,delay: 0.8 },
  { x: 80, y: 45, dur: 6,  delay: 2.2 },
  { x: 50, y: 80, dur: 4.5,delay: 3   },
  { x: 90, y: 70, dur: 5.5,delay: 0.5 },
  { x: 5,  y: 55, dur: 3,  delay: 1.8 },
  { x: 70, y: 25, dur: 6.5,delay: 4   },
  { x: 28, y: 90, dur: 4,  delay: 2.5 },
  { x: 45, y: 40, dur: 5,  delay: 0.2 },
  { x: 65, y: 88, dur: 3.8,delay: 3.5 },
  { x: 88, y: 20, dur: 7,  delay: 1   },
] as const;

// SVG paths for education icons
const ICON_SVGS: Record<string, React.ReactNode> = {
  book: (
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM8 7h8M8 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  ),
  cap: (
    <path d="M12 3L2 8l10 5 10-5-10-5zM2 8v6M6 10.5v5a6 6 0 0 0 12 0v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ),
  pencil: (
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </>
  ),
  bulb: (
    <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 0 1 6 9a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ),
  star: (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  ),
  ruler: (
    <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM7 8v1M7 12v1M7 16v1M11 8v3M15 8v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </>
  ),
};


const WelcomeBackground: React.FC = () => (
  <>
    {/* Scoped keyframes — only for this component, isolated from the rest of the app */}
    <style>{`
      @media (prefers-reduced-motion: no-preference) {
        @keyframes wlc-float {
          0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: var(--op-start); }
          35%  { transform: translateY(-22px) translateX(6px) rotate(4deg); }
          65%  { transform: translateY(-38px) translateX(-4px) rotate(-3deg); }
          100% { transform: translateY(-60px) translateX(2px) rotate(2deg); opacity: 0; }
        }
        @keyframes wlc-drift {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(12px, -8px) scale(1.04); }
          66%  { transform: translate(-8px, 14px) scale(0.97); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes wlc-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%       { opacity: 0.7; transform: scale(1); }
        }
        @keyframes wlc-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .wlc-float, .wlc-drift, .wlc-twinkle, .wlc-spin-slow {
          animation: none !important;
        }
      }
    `}</style>

    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">

      {/* ── Layer 1 : Soft geometric shapes (circles + hexagons) ── */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        {SHAPES.map((s, i) => {
          const style: React.CSSProperties = {
            animation: `wlc-drift ${s.dur}s ease-in-out ${s.delay}s infinite`,
            transformOrigin: `${s.x}% ${s.y}%`,
          };
          if (s.type === 'circle') {
            return (
              <circle
                key={i}
                className="wlc-drift"
                cx={`${s.x}%`}
                cy={`${s.y}%`}
                r={s.size / 2}
                fill={s.color}
                opacity={s.op}
                style={style}
              />
            );
          }
          // hexagon
          const cx = s.x, cy = s.y, r = s.size / 2;
          const pts = Array.from({ length: 6 }, (_, k) => {
            const a = (Math.PI / 180) * (60 * k - 30);
            return `${cx + r * Math.cos(a) * 0.7}% ${cy + r * Math.sin(a) * 0.7}%`;
          }).join(' ');
          return (
            <polygon
              key={i}
              className="wlc-drift"
              points={pts}
              fill={s.color}
              opacity={s.op}
              style={style}
            />
          );
        })}
      </svg>

      {/* ── Layer 2 : Floating education icons ── */}
      {FLOATING_ICONS.map((item, i) => (
        <div
          key={i}
          className="wlc-float absolute"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: item.size,
            height: item.size,
            color: i % 2 === 0 ? '#fda13a' : '#88a6cf',
            opacity: item.op,
            animation: `wlc-float ${item.dur}s ease-in-out ${item.delay}s infinite`,
            ['--op-start' as string]: item.op,
          } as React.CSSProperties}
        >
          <svg
            viewBox="0 0 24 24"
            width={item.size}
            height={item.size}
            style={{
              filter: 'drop-shadow(0 0 4px currentColor)',
            }}
          >
            {ICON_SVGS[item.icon]}
          </svg>
        </div>
      ))}

      {/* ── Layer 3 : Twinkling particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="wlc-twinkle absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            background: i % 2 === 0 ? '#fda13a' : '#ffffff',
            animation: `wlc-twinkle ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  </>
);

// ── Slide data ─────────────────────────────────────────────────────────────────
interface Slide {
  id: number;
  badge: string;
  headline: string;
  subline: string;
  features: { icon: string; label: string }[];
  accentIcon: string;
  accentStat: string;
  accentLabel: string;
}

const SLIDES: Slide[] = [
  {
    id: 0,
    badge: 'Plateforme Nationale RDC',
    headline: 'La gestion scolaire\ndigitalisée pour la RDC',
    subline:
      'Elimu centralise bulletins, inscriptions, paiements et communication entre écoles et familles — en une seule plateforme sécurisée.',
    features: [
      { icon: 'verified', label: 'Conforme aux normes EPST' },
      { icon: 'language', label: '26 provinces couvertes' },
      { icon: 'lock', label: 'Données hébergées en RDC' },
    ],
    accentIcon: 'school',
    accentStat: '500+',
    accentLabel: 'Écoles partenaires',
  },
  {
    id: 1,
    badge: 'Pour les Établissements',
    headline: 'Pilotez votre école\nsans paperasse',
    subline:
      'Notes, bulletins officiels EPST, assiduité, devoirs, finances — tout en temps réel depuis votre tableau de bord.',
    features: [
      { icon: 'description', label: 'Bulletins officiels EPST automatisés' },
      { icon: 'payments', label: 'Caisse & frais scolaires intégrés' },
      { icon: 'schedule', label: 'Gestion des horaires & options' },
    ],
    accentIcon: 'bar_chart',
    accentStat: '98%',
    accentLabel: 'Taux de satisfaction',
  },
  {
    id: 2,
    badge: 'Pour les Familles',
    headline: 'Suivez le dossier\nde votre enfant',
    subline:
      'Consultez les notes, absences, bulletins et payez les frais scolaires en Mobile Money depuis votre téléphone.',
    features: [
      { icon: 'family_restroom', label: 'Suivi scolaire en temps réel' },
      { icon: 'smartphone', label: 'Paiement Mobile Money (M-Pesa, Airtel)' },
      { icon: 'notifications', label: 'Alertes SMS & notifications push' },
    ],
    accentIcon: 'phone_iphone',
    accentStat: '50k+',
    accentLabel: 'Familles inscrites',
  },
  {
    id: 3,
    badge: 'Commencer maintenant',
    headline: 'Prêt à rejoindre\nla communauté Elimu ?',
    subline:
      "Choisissez votre profil et accédez directement à l'espace qui vous correspond. Inscription gratuite pour les familles.",
    features: [
      { icon: 'rocket_launch', label: '1 mois gratuit pour les écoles' },
      { icon: 'support_agent', label: 'Support dédié à Kinshasa & Lubumbashi' },
      { icon: 'update', label: 'Mises à jour continues & nouvelles fonctions' },
    ],
    accentIcon: 'emoji_events',
    accentStat: '#1',
    accentLabel: 'EdTech en RDC',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export interface WelcomePageProps {}

export const WelcomePage: React.FC<WelcomePageProps> = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const isLast = current === SLIDES.length - 1;

  const goTo = useCallback(
    (index: number, dir: 'forward' | 'back' = 'forward') => {
      if (animating || index === current) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 350);
    },
    [animating, current]
  );

  const next = useCallback(() => {
    if (isLast) {
      navigate('/choix');
      return;
    }
    goTo(current + 1, 'forward');
  }, [isLast, current, goTo, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1, 'back');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, goTo, current]);

  const slide = SLIDES[current];

  // translateX classes for enter/exit animation via inline style
  const slideStyle: React.CSSProperties = {
    transform: animating
      ? direction === 'forward'
        ? 'translateX(-40px)'
        : 'translateX(40px)'
      : 'translateX(0)',
    opacity: animating ? 0 : 1,
    transition: 'transform 350ms cubic-bezier(0.4,0,0.2,1), opacity 350ms ease',
  };

  return (
    <div className="min-h-screen bg-[#002547] flex flex-col relative overflow-hidden">
      {/* ── Background decorations : static base ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#1b3b5f] opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full bg-[#032641] opacity-60 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#fda13a] opacity-[0.05] blur-3xl" />
        {/* Subtle grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── Background decorations : animated education layer ── */}
      <WelcomeBackground />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-6 pb-2">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Accueil Elimu">
          <div className="w-9 h-9 rounded-lg bg-[#fda13a] flex items-center justify-center shadow group-hover:scale-105 transition-transform">
            <span className="text-[#002547] font-black text-xl leading-none select-none">E</span>
          </div>
          <span className="text-white font-black text-xl tracking-tight">ELIMU</span>
        </Link>

        <button
          type="button"
          onClick={() => navigate('/choix')}
          className="text-[#88a6cf] hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
          aria-label="Passer l'introduction"
        >
          <span>Passer</span>
          <span className="material-symbols-outlined text-sm">skip_next</span>
        </button>
      </div>

      {/* ── Main slide content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8">
        <div
          className="w-full max-w-3xl mx-auto"
          style={slideStyle}
          key={current} // forces re-mount for animation reset
        >
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fda13a]/15 border border-[#fda13a]/30 text-[#fda13a] text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">{slide.accentIcon}</span>
              {slide.badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-center text-white font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15] mb-5 whitespace-pre-line">
            {slide.headline}
          </h1>

          {/* Subline */}
          <p className="text-center text-[#88a6cf] text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
            {slide.subline}
          </p>

          {/* Feature pills + accent stat */}
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Features */}
            <ul className="flex-1 space-y-3 w-full lg:w-auto">
              {slide.features.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-medium"
                >
                  <span className="material-symbols-outlined text-[#fda13a] text-xl shrink-0">
                    {f.icon}
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>

            {/* Big accent stat */}
            <div className="flex flex-col items-center justify-center w-40 h-40 rounded-2xl bg-[#fda13a]/10 border border-[#fda13a]/20 shrink-0 gap-1">
              <span className="text-[#fda13a] font-black text-5xl leading-none">{slide.accentStat}</span>
              <span className="text-[#88a6cf] text-xs font-semibold text-center leading-snug px-2">
                {slide.accentLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-4 pb-8 sm:pb-10">
        {/* Dot indicators */}
        <div className="flex items-center gap-2.5" role="tablist" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i, i > current ? 'forward' : 'back')}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 h-2.5 bg-[#fda13a]'
                  : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {current > 0 && (
            <button
              type="button"
              onClick={() => goTo(current - 1, 'back')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 text-[#88a6cf] hover:text-white hover:border-white/30 text-sm font-semibold transition-colors"
              aria-label="Slide précédente"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Précédent
            </button>
          )}

          <button
            id="btn-suivant"
            type="button"
            onClick={next}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all duration-200
              ${
                isLast
                  ? 'bg-[#fda13a] text-[#002547] hover:bg-[#e08a22] hover:scale-105 hover:shadow-[0_0_24px_rgba(253,161,58,0.4)] px-8'
                  : 'bg-white text-[#002547] hover:bg-[#f1f4f7] hover:scale-105'
              }
            `}
            aria-label={isLast ? 'Continuer vers le choix de profil' : 'Slide suivante'}
          >
            {isLast ? (
              <>
                <span className="material-symbols-outlined text-base">rocket_launch</span>
                <span>Commencer maintenant</span>
              </>
            ) : (
              <>
                <span>Suivant</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#fda13a] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={current + 1}
            aria-valuemin={1}
            aria-valuemax={SLIDES.length}
          />
        </div>
        <p className="text-[#88a6cf] text-[11px] font-medium">
          {current + 1} / {SLIDES.length}
        </p>
      </div>
    </div>
  );
};
