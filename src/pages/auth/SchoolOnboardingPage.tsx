import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { RDC_26_PROVINCES, RdcProvince } from '../../data/rdcGeography';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export interface SchoolOnboardingPageProps {}

interface CapacityPlan {
  id: string;
  name: string;
  badgeTitle: string;
  capacityRange: string;
  minStudents: number;
  maxStudents: number;
  monthlyPriceUSD: number;
  annualPriceUSD: number;
  features: string[];
  recommended?: boolean;
  tagline: string;
}

export const SchoolOnboardingPage: React.FC<SchoolOnboardingPageProps> = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [plans, setPlans] = useState<CapacityPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  React.useEffect(() => {
    const fetchPlans = async () => {
      if (supabase) {
        const { data, error } = await supabase.from('subscription_plans').select('*').order('monthly_price_usd', { ascending: true });
        if (!error && data) {
          setPlans(data.map(p => ({
            id: p.id,
            name: p.name,
            badgeTitle: p.badge_title,
            capacityRange: p.capacity_range,
            minStudents: p.min_students,
            maxStudents: p.max_students,
            monthlyPriceUSD: p.monthly_price_usd,
            annualPriceUSD: p.annual_price_usd,
            features: p.features || [],
            recommended: p.recommended,
            tagline: p.tagline
          })));
        }
      }
      // Note: we're assuming if supabase fails/missing, we could fallback, but skipping for brevity
      setIsLoadingPlans(false);
    };
    fetchPlans();
  }, []);


  // ── Étape 1 : Choix de l'offre selon capacité ──
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_large');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // ── Étape 2 : Coordonnées de paiement pré-enregistrées ──
  const [paymentProvider, setPaymentProvider] = useState<'mpesa' | 'orange' | 'airtel' | 'card' | 'bank'>('mpesa');
  const [paymentPhone, setPaymentPhone] = useState('+243 81 234 5678');
  const [paymentAccountName, setPaymentAccountName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankName, setBankName] = useState('Rawbank RDC');
  const [bankIban, setBankIban] = useState('');

  // ── Étape 3 : Localisation dans les 26 Provinces de RDC & École ──
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('Kinshasa');
  const [selectedCityOrTown, setSelectedCityOrTown] = useState<string>('Kinshasa (Gombe)');
  const [customCity, setCustomCity] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [approvalNumber, setApprovalNumber] = useState('');
  const [schoolLegalType, setSchoolLegalType] = useState('Privé Homologué');
  const [educationLevel, setEducationLevel] = useState('Tous Cycles (Maternelle, Primaire, Secondaire & Humanités)');

  // ── Étape 4 : Compte Préfet / Directeur ──
  const [adminFullName, setAdminFullName] = useState('');
  const [adminTitle, setAdminTitle] = useState('Préfet des Études / Directeur');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('+243 ');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trouver la province sélectionnée
  const currentProvince: RdcProvince = RDC_26_PROVINCES.find(p => p.name === selectedProvinceName) || RDC_26_PROVINCES[0];
  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[2] || { name: 'Plan', capacityRange: '' };

  // Liste des villes/localités pour la province sélectionnée
  const availableCities = [
    { value: currentProvince.capital, label: `${currentProvince.capital} (Chef-lieu)` },
    { value: currentProvince.secondCity, label: `${currentProvince.secondCity} (2ème ville)` },
    ...(currentProvince.otherTowns?.map(t => ({ value: t, label: t })) || []),
    { value: 'OTHER', label: 'Autre localité / Territoire...' }
  ];

  const handleProvinceChange = (provName: string) => {
    setSelectedProvinceName(provName);
    const prov = RDC_26_PROVINCES.find(p => p.name === provName) || RDC_26_PROVINCES[0];
    setSelectedCityOrTown(prov.capital);
  };

  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      notify('error', 'Configuration requise', 'Veuillez configurer Supabase via .env');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            name: adminFullName,
            role: 'direction'
          }
        }
      });
      if (authError) throw authError;

      // 2. Create School Tenant and link User (via RPC to bypass RLS bootstrap issues)
      const { data: schoolId, error: rpcError } = await supabase.rpc('create_school_with_admin', {
        p_school_name: schoolName,
        p_city: selectedCityOrTown === 'OTHER' ? customCity : selectedCityOrTown,
        p_province: selectedProvinceName,
        p_address: address,
        p_phone: adminPhone,
        p_email: adminEmail,
        p_type: schoolLegalType,
        p_subscription_plan_id: selectedPlanId,
        p_admin_name: adminFullName,
        p_admin_phone: adminPhone,
        p_admin_title: adminTitle
      });
      if (rpcError) throw rpcError;

      if (authData.user) {
        await refreshProfile(authData.user.id);
      }
      notify(
        'success',
        'Établissement Activé avec Succès !',
        `Bienvenue sur Elimu ! Votre période d'essai gratuit pour le "${selectedPlan.name}" est active.`
      );
      navigate('/direction');
    } catch (err: any) {
      notify('error', 'Erreur d\'inscription', err.message || 'Impossible de créer le compte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPlans) {
    return <div className="min-h-screen flex items-center justify-center text-primary">Chargement des offres...</div>;
  }

  return (
    <div className="w-full pb-24 space-y-10 bg-surface">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER INSTITUTIONNEL ELIMU (PLEINE LARGEUR)
          Tokens Elimu : Primary Navy (#002547), Warm Amber (#FDA13A)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-r from-primary via-[#1b3b5f] to-primary text-white py-16 px-4 sm:px-8 lg:px-16 relative overflow-hidden border-b border-primary-container shadow-md">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container text-primary rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>FORFAITS POPULAIRES • 1 TRIMESTRE (90 JOURS) 100% OFFERT</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Grille Tarifaire des <br />
                <span className="text-secondary-container">
                  Établissements Scolaires RDC
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl font-normal">
                Découvrez nos solutions adaptées à l'effectif d'élèves de votre établissement dans les <strong>26 provinces de la RDC</strong>. Digitalisez vos inscriptions, la caisse, les bulletins officiels EPST et la communication parents.
              </p>

              {/* Action Buttons with Elimu Brand Colors */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#pricing-grid"
                  className="px-6 py-3 rounded-md bg-secondary-container hover:bg-[#e08a22] text-primary font-black text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>Explorer les Formules</span>
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                </a>
                <a
                  href="https://wa.me/243810003546?text=Bonjour%20Elimu%20RDC%20je%20souhaite%20des%20informations%20sur%20les%20abonnements"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-md bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-xs"
                >
                  <span className="material-symbols-outlined text-base text-secondary-container">chat</span>
                  <span>Parler à un Conseiller Elimu</span>
                </a>
              </div>
            </div>

            {/* Stats Counter Matrix (Elimu Palette) */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-lg border border-white/15 text-center space-y-1 shadow-sm">
                <span className="text-3xl sm:text-4xl font-black text-secondary-container block">26 / 26</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Provinces RDC</span>
                <p className="text-[10px] text-white/70">Couverture nationale</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-lg border border-white/15 text-center space-y-1 shadow-sm">
                <span className="text-3xl sm:text-4xl font-black text-white block">90 Jours</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Essai 100% Offert</span>
                <p className="text-[10px] text-white/70">1 Trimestre scolaire sans frais</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-lg border border-white/15 text-center space-y-1 shadow-sm">
                <span className="text-3xl sm:text-4xl font-black text-secondary-container block">100%</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Conforme EPST</span>
                <p className="text-[10px] text-white/70">Bulletins & Registres officiels</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-lg border border-white/15 text-center space-y-1 shadow-sm">
                <span className="text-3xl sm:text-4xl font-black text-white block">$0.00</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Débité Aujourd'hui</span>
                <p className="text-[10px] text-white/70">Aucun prélèvement immédiat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CORPS PRINCIPAL PLEINE LARGEUR (MAX 1440px)
      ───────────────────────────────────────────────────────────── */}
      <div id="pricing-grid" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Progress Stepper Tabs */}
        <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-lg border border-outline-variant shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { num: 1, label: '1. Grille des Offres', sub: 'Selon capacité élèves', icon: 'table_chart' },
              { num: 2, label: '2. Règlement Sécurisé', sub: '0$ débité aujourd\'hui', icon: 'credit_card' },
              { num: 3, label: '3. Localisation RDC', sub: 'Les 26 provinces', icon: 'map' },
              { num: 4, label: '4. Compte Préfet', sub: 'Activation & Déploiement', icon: 'admin_panel_settings' },
            ].map(s => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (isCompleted) setStep(s.num as any);
                  }}
                  disabled={!isCompleted && !isActive}
                  className={`p-3.5 rounded-md border text-left flex items-center gap-3.5 transition-all ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : isCompleted
                      ? 'border-success/40 bg-success-container/30 text-on-surface hover:bg-success-container/50 cursor-pointer'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant opacity-70'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? 'bg-secondary-container text-primary shadow-xs'
                        : isCompleted
                        ? 'bg-success text-white'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {isCompleted ? <span className="material-symbols-outlined text-sm font-bold">check</span> : s.num}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-xs truncate">{s.label}</p>
                    <p className={`text-[11px] truncate ${isActive ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                      {s.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ÉTAPE 1 : GRILLE DES TARIFS PLEINE LARGEUR (DESIGN ELIMU)
        ───────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-10">
            {/* Header Section Title */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary block">
                FORFAITS ADAPTÉS À LA CAPACITÉ DE VOTRE ÉTABLISSEMENT
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-primary tracking-tight">
                Tarifs Transparents & Adaptés à Chaque École
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Toutes nos formules incluent <strong>1 Trimestre (3 Mois / 90 Jours) 100% Gratuit</strong>. Aucun frais n'est prélevé avant l'échéance.
              </p>

              {/* Monthly / Annual Billing Toggle */}
              <div className="pt-2 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 p-1.5 bg-surface-container rounded-md border border-outline-variant text-xs font-bold shadow-inner">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2.5 rounded transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-primary text-white shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    Facturation Mensuelle
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-5 py-2.5 rounded transition-all flex items-center gap-1.5 ${
                      billingCycle === 'annual'
                        ? 'bg-primary text-white shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span>Facturation Annuelle</span>
                    <span className="text-[10px] bg-secondary-container text-primary font-black px-2 py-0.5 rounded-full">
                      -20% Offert
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Cards Grid - Fully Expanded Across Screen */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {plans.map(plan => {
                const isSelected = selectedPlanId === plan.id;
                const price = billingCycle === 'annual' ? plan.annualPriceUSD : plan.monthlyPriceUSD;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden relative bg-surface-container-lowest ${
                      isSelected
                        ? 'border-primary shadow-xl ring-2 ring-primary/20 -translate-y-1'
                        : plan.recommended
                        ? 'border-secondary-container shadow-md hover:shadow-lg'
                        : 'border-outline-variant hover:border-primary/50 shadow-xs hover:shadow-md'
                    }`}
                  >
                    {/* Top Recommended Tag */}
                    {plan.recommended && (
                      <div className="bg-secondary-container text-primary text-center py-1.5 text-xs font-black uppercase tracking-wider shadow-xs">
                        ★ FORMULE RECOMMANDÉE RDC
                      </div>
                    )}

                    {/* Card Header */}
                    <div className={`p-5 border-b ${isSelected ? 'bg-primary-fixed/20' : 'bg-surface-container-low'} border-outline-variant/60 space-y-2`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-primary bg-white px-2.5 py-0.5 rounded border border-outline-variant">
                          {plan.capacityRange}
                        </span>
                        <span className="text-xs font-bold text-on-surface-variant">{plan.badgeTitle}</span>
                      </div>

                      <h3 className="font-extrabold text-xl text-primary pt-1">{plan.name}</h3>
                      <p className="text-xs text-on-surface-variant leading-snug">{plan.tagline}</p>
                    </div>

                    {/* Pricing Block */}
                    <div className="p-5 space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="p-3.5 rounded bg-surface-container-low border border-outline-variant/60 space-y-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-primary">${price}</span>
                            <span className="text-xs text-on-surface-variant font-bold">USD / mois</span>
                          </div>
                          {billingCycle === 'annual' && (
                            <p className="text-[10px] text-on-surface-variant">
                              Facturé annuellement (${price * 12} USD/an)
                            </p>
                          )}
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-container text-success text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-success" />
                              1er Trimestre : $0.00 Gratuit
                            </span>
                          </div>
                        </div>

                        {/* Feature Checklist */}
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Ce qui est inclus :
                          </p>
                          <ul className="space-y-2 text-xs text-on-surface">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 leading-tight">
                                <span className="text-success font-bold text-xs shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <span className="text-xs">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Select Button */}
                      <div className="pt-4 border-t border-outline-variant/60">
                        <button
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`w-full py-2.5 px-4 rounded font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-primary text-white shadow-sm hover:bg-primary-container'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                          }`}
                        >
                          <span>{isSelected ? '✓ Formule Sélectionnée' : 'Choisir cette Formule'}</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Next Step Bar */}
            <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-primary font-black text-xl shrink-0">
                  90J
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-primary">
                    Formule choisie : <span className="text-secondary">{selectedPlan.name}</span> ({selectedPlan.capacityRange})
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Période d'essai : <strong>1 Trimestre Scolaire (90 Jours) sans aucun frais ($0.00 débité aujourd'hui)</strong>
                  </p>
                </div>
              </div>

              <Button
                variant="accent"
                size="lg"
                onClick={() => setStep(2)}
                icon="arrow_forward"
                iconPosition="right"
                className="font-black text-sm px-8 shadow w-full sm:w-auto"
              >
                Continuer vers l'Enregistrement du Règlement
              </Button>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                TABLEAU COMPARATIF COMPLET DES FONCTIONNALITÉS
            ───────────────────────────────────────────────────────────── */}
            <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant shadow-sm space-y-4">
              <div className="border-b border-outline-variant pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-primary block">
                  COMPARAISON TECHNIQUE DÉTAILLÉE
                </span>
                <h3 className="text-xl font-extrabold text-primary mt-0.5">
                  Tableau Comparatif des Modules par Formule
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-bold">
                      <th className="p-3.5 min-w-[240px]">Modules & Services Elimu RDC</th>
                      <th className="p-3.5 text-center min-w-[140px]">Plan Starter (≤250)</th>
                      <th className="p-3.5 text-center min-w-[140px]">Plan Pro (251-600)</th>
                      <th className="p-3.5 text-center min-w-[170px] bg-primary/5 text-primary font-black border-x border-primary/20">
                        Plan Business (601-1500)
                      </th>
                      <th className="p-3.5 text-center min-w-[140px]">Plan Entreprise+ (+1500)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60 text-xs text-on-surface">
                    <tr className="hover:bg-surface-container-low/40">
                      <td className="p-3.5 font-bold text-on-surface">Registre Matricule National EPST RDC</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm bg-primary/5 border-x border-primary/20">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40">
                      <td className="p-3.5 font-bold text-on-surface">Bulletins Scolaires Officiels EPST (Impression A4)</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm bg-primary/5 border-x border-primary/20">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40">
                      <td className="p-3.5 font-bold text-on-surface">Appel Journalier & Pointage Présences</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm bg-primary/5 border-x border-primary/20">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40">
                      <td className="p-3.5 font-bold text-on-surface">Passerelle SMS & WhatsApp Parents (RDC)</td>
                      <td className="p-3.5 text-center text-on-surface-variant font-medium">Standard</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓ Automatisé</td>
                      <td className="p-3.5 text-center text-success font-black text-sm bg-primary/5 border-x border-primary/20">✓ Illimité</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓ Dédié</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40">
                      <td className="p-3.5 font-bold text-on-surface">Paiements Mobile Money Direct (M-Pesa, Orange, Airtel)</td>
                      <td className="p-3.5 text-center text-on-surface-variant opacity-40">-</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm bg-primary/5 border-x border-primary/20">✓ Temps Réel</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓ Multi-Comptes</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40">
                      <td className="p-3.5 font-bold text-on-surface">Cartes d'Élèves Sécurisées avec QR Code</td>
                      <td className="p-3.5 text-center text-on-surface-variant opacity-40">-</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓</td>
                      <td className="p-3.5 text-center text-success font-black text-sm bg-primary/5 border-x border-primary/20">✓ Haute Résolution</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓ Personnalisées</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40">
                      <td className="p-3.5 font-bold text-on-surface">Gestion Multi-Sites & Multi-Implantations</td>
                      <td className="p-3.5 text-center text-on-surface-variant opacity-40">-</td>
                      <td className="p-3.5 text-center text-on-surface-variant opacity-40">-</td>
                      <td className="p-3.5 text-center text-on-surface-variant bg-primary/5 border-x border-primary/20 opacity-40">-</td>
                      <td className="p-3.5 text-center text-success font-black text-sm">✓ Inclus</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ÉTAPE 2 : ENREGISTREMENT RÈGLEMENT (0$ MAINTENANT)
        ───────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-surface-container-lowest p-6 sm:p-10 rounded-lg border border-outline-variant shadow-sm space-y-6">
            <div className="border-b border-outline-variant pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-container">lock_person</span>
                  <span>2. Enregistrement Sécurisé des Coordonnées de Paiement</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Activez votre <strong>essai gratuit de 1 trimestre (90 jours)</strong>. Aucun prélèvement aujourd'hui.
                </p>
              </div>
              <Badge variant="success" size="md" className="font-extrabold text-xs">
                Montant Débité Aujourd'hui : $0.00 USD
              </Badge>
            </div>

            {/* Recap Banner */}
            <div className="p-5 bg-primary-fixed/20 border border-primary/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Formule Sélectionnée :</span>
                <p className="font-black text-primary text-base">{selectedPlan.name} ({selectedPlan.capacityRange})</p>
                <p className="text-on-surface-variant">${billingCycle === 'annual' ? selectedPlan.annualPriceUSD : selectedPlan.monthlyPriceUSD} USD / mois après la fin de la période d'essai</p>
              </div>
              <div className="text-right">
                <Badge variant="warning" size="md" icon="event">
                  Première Échéance : dans 90 Jours
                </Badge>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-on-surface-variant block">
                Choisissez votre canal de règlement pré-enregistré :
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'mpesa', name: 'M-Pesa (Vodacom)', icon: 'phone_android' },
                  { id: 'orange', name: 'Orange Money', icon: 'phone_iphone' },
                  { id: 'airtel', name: 'Airtel Money', icon: 'smartphone' },
                  { id: 'card', name: 'Carte Visa / MC', icon: 'credit_card' },
                  { id: 'bank', name: 'Banque RDC (Rawbank...)', icon: 'account_balance' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentProvider(m.id as any)}
                    className={`p-4 rounded-md border-2 font-bold text-left flex flex-col items-center justify-center text-center gap-2 transition-all ${
                      paymentProvider === m.id
                        ? 'border-primary bg-primary-fixed/40 text-primary shadow-xs ring-2 ring-primary/20'
                        : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl text-primary">{m.icon}</span>
                    <span className="text-xs leading-tight">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input details */}
            {(paymentProvider === 'mpesa' || paymentProvider === 'orange' || paymentProvider === 'airtel') && (
              <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={`Numéro Téléphone / Compte Marchand ${paymentProvider.toUpperCase()} *`}
                    placeholder="+243 81 234 5678"
                    value={paymentPhone}
                    onChange={e => setPaymentPhone(e.target.value)}
                    required
                  />
                  <Input
                    label="Nom du Titulaire du Compte (Direction / Gestionnaire) *"
                    placeholder="ex: Collège Boboto / Direction"
                    value={paymentAccountName}
                    onChange={e => setPaymentAccountName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {paymentProvider === 'card' && (
              <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-4">
                <Input
                  label="Numéro de Carte Bancaire (Visa / Mastercard) *"
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date d'Expiration (MM/AA) *"
                    placeholder="08/28"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    required
                  />
                  <Input
                    label="Code CVV (3 chiffres au dos) *"
                    placeholder="123"
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {paymentProvider === 'bank' && (
              <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Établissement Bancaire Partenaire RDC *"
                    options={['Rawbank RDC', 'Equity BCDC', 'Trust Merchant Bank (TMB)', 'Ecobank RDC', 'Sofibanque', 'Afriland First Bank']}
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                  />
                  <Input
                    label="Numéro de Compte / IBAN de l'École *"
                    placeholder="CD68 0001 0000 1234 5678 90"
                    value={bankIban}
                    onChange={e => setBankIban(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-outline-variant">
              <Button variant="outline" type="button" onClick={() => setStep(1)} icon="arrow_back">
                Retour aux Offres
              </Button>
              <Button
                variant="primary"
                size="lg"
                type="button"
                onClick={() => {
                  if (!paymentPhone && !cardNumber && !bankIban) {
                    notify('warning', 'Coordonnées Requises', 'Veuillez enregistrer votre moyen de règlement.');
                    return;
                  }
                  setStep(3);
                }}
                icon="arrow_forward"
                iconPosition="right"
                className="font-bold shadow-md"
              >
                Continuer vers la Localisation (26 Provinces)
              </Button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ÉTAPE 3 : LOCALISATION DANS LES 26 PROVINCES DE RDC
        ───────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-surface-container-lowest p-6 sm:p-10 rounded-lg border border-outline-variant shadow-sm space-y-6">
            <div className="border-b border-outline-variant pb-4">
              <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container">map</span>
                <span>3. Localisation dans les 26 Provinces de la RDC & Informations de l'École</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Indexation officielle de votre établissement dans l'annuaire national Elimu RDC.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1.5">
                  Province de la RDC (26 Provinces) *
                </label>
                <select
                  className="w-full h-12 px-3.5 bg-surface-container-low border border-outline-variant rounded text-xs font-bold text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={selectedProvinceName}
                  onChange={e => handleProvinceChange(e.target.value)}
                >
                  {RDC_26_PROVINCES.map(p => (
                    <option key={p.code} value={p.name}>
                      {p.name} (Chef-lieu : {p.capital})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1.5">
                  Chef-Lieu / Ville / Localité de l'École *
                </label>
                <select
                  className="w-full h-12 px-3.5 bg-surface-container-low border border-outline-variant rounded text-xs font-bold text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={selectedCityOrTown}
                  onChange={e => setSelectedCityOrTown(e.target.value)}
                >
                  {availableCities.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCityOrTown === 'OTHER' && (
              <Input
                label="Précisez le Territoire ou la Localité Spécifique *"
                placeholder="ex: Territoire de Kasangulu, Quartier Météo..."
                value={customCity}
                onChange={e => setCustomCity(e.target.value)}
                required
              />
            )}

            <Input
              label="Nom Officiel de l’Établissement (Arrêté Ministériel) *"
              placeholder="ex: Collège Boboto, Lycée Liziba, Complexe Scolaire Cardinal Malula..."
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Adresse Physique Complète *"
                placeholder="N° Avenue, Quartier..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
              <Input
                label="N° Arrêté d'Agrément MINAS / EPST"
                placeholder="ex: MINEPST/CABMIN/0842/2018"
                value={approvalNumber}
                onChange={e => setApprovalNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Statut Juridique & Conventionnel *"
                options={[
                  'Privé Homologué',
                  'Public Conventionné Catholique',
                  'Public Conventionné Protestant',
                  'Public Conventionné Kimbanguiste',
                  'Public Conventionné Islamique',
                  'Public Non Conventionné (Officiel)',
                  'International'
                ]}
                value={schoolLegalType}
                onChange={e => setSchoolLegalType(e.target.value)}
              />

              <Select
                label="Cycles & Niveaux d'Enseignement *"
                options={[
                  'Tous Cycles (Maternelle, Primaire, Secondaire & Humanités)',
                  'Secondaire & Humanités Uniquement',
                  'Primaire & Éducation de Base',
                  'Maternelle & Primaire'
                ]}
                value={educationLevel}
                onChange={e => setEducationLevel(e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-6 border-t border-outline-variant">
              <Button variant="outline" type="button" onClick={() => setStep(2)} icon="arrow_back">
                Précédent
              </Button>
              <Button
                variant="primary"
                size="lg"
                type="button"
                onClick={() => {
                  if (!schoolName || !address) {
                    notify('warning', 'Champs Obligatoires', 'Veuillez renseigner le nom et l’adresse de l’établissement.');
                    return;
                  }
                  setStep(4);
                }}
                icon="arrow_forward"
                iconPosition="right"
                className="font-bold shadow-md"
              >
                Continuer vers le Compte Préfet
              </Button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ÉTAPE 4 : COMPTE PRÉFET & DÉPLOIEMENT
        ───────────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-surface-container-lowest p-6 sm:p-10 rounded-lg border border-outline-variant shadow-sm space-y-6">
            <form onSubmit={handleFinishOnboarding} className="space-y-6">
              <div className="border-b border-outline-variant pb-4">
                <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-container">account_circle</span>
                  <span>4. Création du Compte Gestionnaire & Déploiement</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Ce compte permettra au Chef d'Établissement d'administrer les accès enseignants, secrétaires et comptables.
                </p>
              </div>

              {/* Recap Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2">
                  <span className="text-[10px] uppercase font-black text-on-surface-variant block">Établissement & Localisation :</span>
                  <p className="font-black text-primary text-base">{schoolName || 'Collège National'}</p>
                  <p className="text-on-surface">Province : <strong>{selectedProvinceName}</strong> • {selectedCityOrTown}</p>
                  <p className="text-on-surface-variant">{address}</p>
                  <p className="text-on-surface-variant font-semibold">{schoolLegalType} • {educationLevel}</p>
                </div>

                <div className="p-5 bg-surface-container-low rounded-lg border border-outline-variant space-y-2">
                  <span className="text-[10px] uppercase font-black text-on-surface-variant block">Formule & Trimestre Gratuit :</span>
                  <p className="font-black text-primary text-base">{selectedPlan.name}</p>
                  <p className="text-on-surface">Capacité : {selectedPlan.capacityRange}</p>
                  <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
                    <span className="font-mono text-primary font-bold">Règlement : {paymentProvider.toUpperCase()} ({paymentPhone})</span>
                    <Badge variant="success" size="sm" className="font-bold">1 Trimestre : $0.00</Badge>
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom & Post-nom du Chef d’Établissement / Préfet *"
                  placeholder="ex: Prof. Dieudonné Mwamba"
                  value={adminFullName}
                  onChange={e => setAdminFullName(e.target.value)}
                  required
                />
                <Select
                  label="Fonction Administrative *"
                  options={[
                    'Préfet des Études / Directeur',
                    'Recteur / Promoteur',
                    'Directeur des Études',
                    'Secrétaire Général',
                    'Administrateur Gestionnaire'
                  ]}
                  value={adminTitle}
                  onChange={e => setAdminTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Professionnel de la Direction *"
                  type="email"
                  placeholder="direction@ecole.cd"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  required
                />
                <Input
                  label="Téléphone / WhatsApp de la Direction *"
                  placeholder="+243 81 234 5678"
                  value={adminPhone}
                  onChange={e => setAdminPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Mot de Passe de Sécurité *"
                type="password"
                placeholder="Au moins 8 caractères sécurisés"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
              />

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-xs space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked required className="mt-0.5 rounded text-primary" />
                  <span className="text-on-surface leading-relaxed">
                    J'atteste être le représentant légal de l'établissement et j'accepte les conditions d'utilisation d'Elimu RDC, incluant les 90 jours d'essai gratuit et les règles de conformité du Ministère de l'EPST.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant">
                <Button variant="outline" type="button" onClick={() => setStep(3)} icon="arrow_back">
                  Précédent
                </Button>
                <Button
                  variant="accent"
                  size="lg"
                  type="submit"
                  isLoading={isSubmitting}
                  icon="rocket_launch"
                  className="font-black text-sm px-8 shadow-lg"
                >
                  Déployer l'Espace École (1 Trimestre Gratuit)
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
