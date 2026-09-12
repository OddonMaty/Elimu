import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { getDefaultRouteForRole } from '../../lib/roleRoutes';

export const ActivateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  const { notify } = useNotification();
  const { refreshProfile } = useAuth();
  
  const [code, setCode] = useState(initialCode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !email || !password) {
      notify('error', 'Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password.length < 6) {
      notify('warning', 'Mot de passe faible', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client is not configured.');
      }

      // 1. Sign up the user (create auth record)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Un compte existe déjà avec cet email. Veuillez vous connecter et l\'invitation sera appliquée si applicable, ou contactez l\'école.');
        }
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Erreur inconnue lors de la création du compte.');
      }

      // 2. Redeem the invitation
      const { data: redeemData, error: redeemError } = await supabase.rpc('redeem_invitation', {
        p_code: code.toUpperCase()
      });

      if (redeemError) {
        // If redeeming fails, we should ideally clean up the auth record, but for simplicity we just surface the error.
        throw new Error(redeemError.message || 'Code invalide ou déjà utilisé.');
      }

      // 3. Refresh Auth Context
      await refreshProfile(authData.user.id);

      // 4. Redirect based on role
      notify('success', 'Compte Activé !', 'Bienvenue sur Elimu.');
      navigate(getDefaultRouteForRole(redeemData.role));

    } catch (err: any) {
      notify('error', 'Échec de l\'activation', err.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface-container-lowest p-8 rounded-2xl shadow-xl border border-outline-variant">
        <div>
          <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg mb-6">
            <span className="material-symbols-outlined text-white text-3xl">vpn_key</span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-black text-primary tracking-tight">
            Activer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Saisissez le code d'invitation reçu par votre école.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">
                Code d'activation
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-outline-variant bg-surface-container-lowest placeholder-on-surface-variant/50 text-primary font-mono text-center text-xl font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow uppercase tracking-[0.2em]"
                placeholder="EX: A3F9K2LX"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">
                Votre adresse email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-outline-variant bg-surface-container-lowest placeholder-on-surface-variant/50 text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow sm:text-sm"
                placeholder="nom@exemple.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">
                Créer un mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-outline-variant bg-surface-container-lowest placeholder-on-surface-variant/50 text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow sm:text-sm"
                placeholder="••••••••"
              />
              <p className="mt-1 text-[10px] text-on-surface-variant text-right">Min. 6 caractères</p>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              className="text-base font-extrabold shadow-md hover:shadow-lg transition-all"
            >
              Créer mon compte
            </Button>
          </div>
          
          <div className="text-center text-sm text-on-surface-variant">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
