import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useNotification } from '../../context/NotificationContext';
import { getDefaultRouteForRole } from '../../lib/roleRoutes';

export interface LoginPageProps {}

// Environnement de test : projet Supabase « elimu-dev ». Le bandeau ci-dessous n'apparaît que là.
const DEV_PROJECT_REF = 'ouzwzsklgnqhyjcwaskn';
const IS_TEST_ENV = String(import.meta.env.VITE_SUPABASE_URL || '').includes(DEV_PROJECT_REF);
const DEMO_PASSWORD = 'ElimuDev#2026';
const DEMO_ACCOUNTS = [
  { label: 'Direction', email: 'direction@elimu.test' },
  { label: 'Secrétariat', email: 'secretariat@elimu.test' },
  { label: 'Enseignant', email: 'enseignant@elimu.test' },
  { label: 'Parent 1', email: 'parent1@elimu.test' },
  { label: 'Parent 2', email: 'parent2@elimu.test' },
  { label: 'Autre école', email: 'autre.ecole@elimu.test' }
];

export const LoginPage: React.FC<LoginPageProps> = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, undefined, password);
      notify('success', 'Connexion Réussie', 'Bienvenue sur Elimu.');
      navigate(user ? getDefaultRouteForRole(user.role) : '/');
    } catch (err: any) {
      notify('error', 'Erreur de connexion', err.message || 'Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <Link to="/schools" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary text-secondary-container font-black text-3xl flex items-center justify-center mx-auto shadow-md">
            E
          </div>
        </Link>
        <h2 className="text-2xl font-black text-primary tracking-tight">Connexion Sécurisée Elimu</h2>
        <p className="text-xs text-on-surface-variant">
          Portail Unifié de Gestion Scolaire & Espace Parent RDC
        </p>
      </div>

      {IS_TEST_ENV && (
        <div className="p-4 rounded-xl border border-secondary-container/50 bg-secondary-container/20 space-y-3 text-xs">
          <p className="font-extrabold text-primary text-sm">Environnement de test (elimu-dev)</p>
          <p className="text-on-surface-variant">
            Données de démonstration uniquement. Cliquez sur un profil pour remplir la connexion (mot de passe commun :{' '}
            <span className="font-mono font-bold">{DEMO_PASSWORD}</span>).
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword(DEMO_PASSWORD); }}
                className="px-3 py-1.5 rounded-full border border-outline-variant bg-surface text-on-surface font-semibold hover:bg-surface-container-low"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Card noPadding className="p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Professionnel / Identifiant *"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon="mail"
            required
            placeholder="votre@email.com"
          />
          <Input
            label="Mot de passe *"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon="lock"
            required
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-on-surface">
              <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary" />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#forgot" className="text-primary font-semibold hover:underline">
              Besoin d'aide ?
            </a>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            type="submit"
            isLoading={isLoading}
            icon="login"
            className="font-bold shadow"
          >
            Se Connecter
          </Button>
        </form>
      </Card>

      {/* Prominent CTA for New Schools (1 Month Free Trial) */}
      <div className="p-4 bg-secondary-container/15 border border-secondary-container/30 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="font-extrabold text-primary text-sm">🏫 Vous êtes une école ?</p>
          <p className="text-on-surface-variant">Inscrivez votre établissement avec <strong>1 Mois Gratuit</strong>.</p>
        </div>
        <Link to="/onboarding">
          <Button variant="accent" size="sm" icon="add_business">
            Créer un Compte
          </Button>
        </Link>
      </div>
    </div>
  );
};
