import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Types ────────────────────────────────────────────────────────────────────────
export interface NavigationTransitionProps {
  /** Material Symbols icon name shown during the transition */
  icon: string;
  /** Short contextual message (e.g. "Préparation de l'annuaire...") */
  message: string;
  /** Destination route to navigate to after the transition */
  href: string;
  /** Accent color for the icon badge — defaults to amber */
  accentColor?: '#fda13a' | '#88a6cf' | '#ffffff';
  /**
   * Called when the transition is complete (navigation happened).
   * Useful to reset parent state when used inside a page component.
   */
  onDone?: () => void;
}

// ── Timing constants ──────────────────────────────────────────────────────────
const FADE_IN_MS  = 380;  // overlay appears
const HOLD_MS     = 620;  // icon+message visible
const FADE_OUT_MS = 380;  // overlay disappears before navigate

// ── Component ─────────────────────────────────────────────────────────────────
export const NavigationTransition: React.FC<NavigationTransitionProps> = ({
  icon,
  message,
  href,
  accentColor = '#fda13a',
  onDone,
}) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'entering' | 'visible' | 'leaving'>('entering');

  // Respect prefers-reduced-motion: skip animation, navigate immediately
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) {
      navigate(href, { replace: false });
      onDone?.();
      return;
    }

    // Phase 1 → visible
    const t1 = setTimeout(() => setPhase('visible'), FADE_IN_MS);
    // Phase 2 → leaving
    const t2 = setTimeout(() => setPhase('leaving'), FADE_IN_MS + HOLD_MS);
    // Phase 3 → navigate
    const t3 = setTimeout(() => {
      navigate(href, { replace: false });
      onDone?.();
    }, FADE_IN_MS + HOLD_MS + FADE_OUT_MS);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity =
    phase === 'entering' ? 0 :
    phase === 'visible'  ? 1 : 0;

  const scale =
    phase === 'entering' ? 0.88 :
    phase === 'visible'  ? 1    : 1.04;

  return (
    <>
      {/* Scoped keyframes — isolated, only injected when this component mounts */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes nt-pulse-ring {
            0%   { transform: scale(1);    opacity: 0.55; }
            70%  { transform: scale(1.55); opacity: 0;    }
            100% { transform: scale(1.55); opacity: 0;    }
          }
          @keyframes nt-icon-bob {
            0%, 100% { transform: translateY(0px);  }
            50%       { transform: translateY(-5px); }
          }
          @keyframes nt-dots {
            0%   { opacity: 0.2; }
            50%  { opacity: 1;   }
            100% { opacity: 0.2; }
          }
        }
      `}</style>

      {/* ── Full-screen overlay ── */}
      <div
        role="status"
        aria-live="polite"
        aria-label={message}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, #002547 0%, #032641 60%, #0a1e35 100%)',
          opacity,
          transform: `scale(${scale})`,
          transition: `opacity ${phase === 'entering' ? FADE_IN_MS : FADE_OUT_MS}ms cubic-bezier(0.4,0,0.2,1), transform ${phase === 'entering' ? FADE_IN_MS : FADE_OUT_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          pointerEvents: 'all',
        }}
      >
        {/* ── Subtle background glow ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${accentColor}0A 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* ── Icon badge with pulsing ring ── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outer pulse ring */}
          {phase === 'visible' && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 96,
                height: 96,
                borderRadius: '50%',
                border: `2px solid ${accentColor}`,
                animation: 'nt-pulse-ring 1.2s ease-out infinite',
              }}
            />
          )}
          {/* Second ring, offset */}
          {phase === 'visible' && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 96,
                height: 96,
                borderRadius: '50%',
                border: `2px solid ${accentColor}`,
                animation: 'nt-pulse-ring 1.2s ease-out 0.4s infinite',
              }}
            />
          )}

          {/* Icon badge */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `${accentColor}1A`,
              border: `2px solid ${accentColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: phase === 'visible' ? 'nt-icon-bob 1.8s ease-in-out infinite' : 'none',
              boxShadow: `0 0 32px ${accentColor}33`,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 36,
                color: accentColor,
                filter: `drop-shadow(0 0 8px ${accentColor}88)`,
              }}
            >
              {icon}
            </span>
          </div>
        </div>

        {/* ── Elimu wordmark ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#fda13a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#002547', fontWeight: 900, fontSize: 18, lineHeight: 1, userSelect: 'none' }}>E</span>
          </div>
          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', userSelect: 'none' }}>ELIMU</span>
        </div>

        {/* ── Contextual message ── */}
        <div style={{ textAlign: 'center', maxWidth: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p
            style={{
              color: '#e8eef6',
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.5,
              letterSpacing: '-0.01em',
            }}
          >
            {message}
          </p>

          {/* Animated loading dots */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
            {[0, 0.25, 0.5].map((delay, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: accentColor,
                  animation: `nt-dots 1.1s ease-in-out ${delay}s infinite`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
