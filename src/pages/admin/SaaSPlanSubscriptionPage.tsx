import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';

import { supabase } from '../../lib/supabaseClient';

export interface SaaSPlanSubscriptionPageProps {}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  highlight: boolean;
}

export const SaaSPlanSubscriptionPage: React.FC<SaaSPlanSubscriptionPageProps> = () => {
  const [currentPlan, setCurrentPlan] = useState('plan_medium');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();

  React.useEffect(() => {
    const fetchPlans = async () => {
      if (supabase) {
        const { data, error } = await supabase.from('subscription_plans').select('*').order('monthly_price_usd', { ascending: true });
        if (!error && data) {
          setPlans(data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.monthly_price_usd,
            currency: 'USD/mois',
            description: p.tagline,
            features: p.features || [],
            highlight: p.highlight
          })));
        }
      }
      setIsLoading(false);
    };
    fetchPlans();
  }, []);


  const handleUpgrade = (planId: string) => {
    setCurrentPlan(planId);
    const plan = plans.find(p => p.id === planId);
    notify('success', 'Plan Mis à Jour !', `Votre établissement est maintenant sous le plan ${plan?.name} à $${plan?.price}/mois. Facturation déclenchée.`);
  };

  if (isLoading) {
    return <div>Chargement des plans...</div>;
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Plans & Abonnements SaaS Elimu
        </h1>
        <p className="text-xs text-on-surface-variant">
          Choisissez le plan qui correspond aux besoins de votre établissement scolaire
        </p>
      </div>

      {/* Current Plan Alert */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
        <span className="material-symbols-outlined text-primary text-2xl">verified</span>
        <div>
          <p className="font-bold text-sm text-primary">Plan Actuel : Premium</p>
          <p className="text-xs text-on-surface-variant">Facturé mensuellement · Prochain renouvellement : 01/10/2026 · $149.00 USD</p>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              noPadding
              className={`p-6 flex flex-col justify-between space-y-4 transition-all overflow-visible ${
                plan.highlight
                  ? 'border-2 border-primary shadow-lg relative'
                  : 'border border-outline-variant'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary-container text-primary text-[10px] font-black px-3 py-1 rounded-full shadow">
                    ★ RECOMMANDÉ
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-black text-primary">{plan.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{plan.description}</p>
                </div>

                <div className="py-3 border-y border-outline-variant">
                  <span className="text-3xl font-black text-primary">${plan.price}</span>
                  <span className="text-xs text-on-surface-variant ml-1">{plan.currency}</span>
                </div>

                <ul className="space-y-1.5 text-xs">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`${f.startsWith('✗') ? 'text-on-surface-variant opacity-50' : 'text-on-surface'}`}>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {isCurrent ? (
                <Badge variant="success" size="md" className="text-center justify-center w-full py-2">
                  ✓ Plan Actif
                </Badge>
              ) : (
                <Button
                  variant={plan.highlight ? 'accent' : 'primary'}
                  fullWidth
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === currentPlan) ? 'Passer au Plan' : 'Rétrograder vers'} {plan.name}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
