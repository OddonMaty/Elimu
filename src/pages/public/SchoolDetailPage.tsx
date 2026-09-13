import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { School } from '../../types';
import { schoolService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface SchoolDetailPageProps {}

export const SchoolDetailPage: React.FC<SchoolDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await schoolService.getSchoolById(id || 'sch-1');
      if (data) setSchool(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner message="Chargement des informations de l'établissement..." />;
  if (!school) return <div className="p-12 text-center text-error">Établissement introuvable.</div>;

  return (
    <div className="space-y-8 pb-16">
      {/* Cover Header Banner */}
      <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-outline-variant">
        <img
          src={school.coverImage}
          alt={school.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
          <Link to="/" className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/80 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Tous les établissements</span>
          </Link>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="warning" size="sm" icon="verified">
                Homologué Ministère EPST
              </Badge>
              <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-bold">
                Fondé en {school.foundedYear}
              </span>
              <span className="text-xs bg-secondary-container text-primary font-black px-2.5 py-0.5 rounded-full">
                Examen d’État : {school.passRateStateExam}% de réussite
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow">{school.name}</h1>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{school.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/register?schoolId=${school.id}`}>
              <Button variant="accent" size="lg" icon="how_to_reg" className="font-extrabold shadow-lg">
                Inscrire un Élève en Ligne
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Overview, Sections, Infrastructure, Requirements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview Card */}
          <Card title="Présentation de l’Établissement" subtitle="Histoire, valeurs et projet éducatif">
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
              {school.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-outline-variant/60">
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Effectif</span>
                <span className="text-lg font-black text-primary">{school.studentCount}</span>
                <span className="text-[10px] text-on-surface-variant block">Élèves inscrits</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Corps Enseignant</span>
                <span className="text-lg font-black text-primary">{school.teacherCount}</span>
                <span className="text-[10px] text-on-surface-variant block">Professeurs qualifiés</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Réussite Exetat</span>
                <span className="text-lg font-black text-secondary-container">{school.passRateStateExam}%</span>
                <span className="text-[10px] text-on-surface-variant block">Moyenne officielle</span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Type</span>
                <span className="text-sm font-bold text-on-surface block mt-1">{school.type}</span>
              </div>
            </div>
          </Card>

          {/* Sections & Options Card */}
          <Card title="Filières & Options Offertes" subtitle="Programmes officiels du système éducatif congolais">
            <div className="space-y-3">
              {school.sections.map((sec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/60">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">school</span>
                  <div>
                    <h4 className="font-bold text-sm text-primary">{sec}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Programme renforcé avec travaux pratiques, sessions informatiques et préparation ciblée aux épreuves d'État.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Infrastructure Card */}
          <Card title="Infrastructures & Équipements" subtitle="Environnement pédagogique et sécurité">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {school.infrastructure.map((inf, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/60">
                  <span className="material-symbols-outlined text-secondary-container text-lg">check_circle</span>
                  <span className="text-xs font-semibold text-on-surface">{inf}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Required Documents Card */}
          <Card title="Pièces à Fournir pour l’Inscription" subtitle="Constitution du dossier scolaire">
            <ul className="space-y-2">
              {school.documentsRequired.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-on-surface">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Sidebar: Tuition, Location, Payment & Direct CTA */}
        <div className="space-y-6">
          
          {/* Tuition Summary Card */}
          <Card title="Frais de Scolarité" subtitle="Année académique 2025 - 2026" variant="highlight">
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 text-center">
                <span className="text-xs text-on-surface-variant uppercase font-bold block">Minerval Annuel</span>
                <span className="text-3xl font-black text-primary block my-1">
                  ${school.annualTuitionMinUSD} - ${school.annualTuitionMaxUSD}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Payable en 3 tranches semestrielles
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant">Frais de Dossier / Inscription :</span>
                  <span className="font-bold text-on-surface">$25.00 USD</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant">1ère Tranche (Rentrée) :</span>
                  <span className="font-bold text-on-surface">40% du total</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant">2ème Tranche (Février) :</span>
                  <span className="font-bold text-on-surface">30% du total</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">3ème Tranche (Mai) :</span>
                  <span className="font-bold text-on-surface">30% du total</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="pt-3 border-t border-outline-variant/60">
                <span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-2">
                  Modes de Règlement Acceptés :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {school.paymentMethods.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 bg-surface-container rounded text-[11px] font-bold text-primary">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <Link to={`/register?schoolId=${school.id}`} className="block pt-2">
                <Button variant="accent" size="lg" fullWidth icon="send">
                  Déposer une Candidature
                </Button>
              </Link>
            </div>
          </Card>

          {/* Contact Card */}
          <Card title="Coordonnées de l’Établissement">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
                <div>
                  <p className="font-bold text-on-surface">Adresse physique :</p>
                  <p className="text-on-surface-variant">{school.address}</p>
                  <p className="text-on-surface-variant font-medium">{school.city}, {school.province}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">call</span>
                <div>
                  <p className="font-bold text-on-surface">Secrétariat :</p>
                  <p className="text-on-surface-variant font-mono">{school.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">mail</span>
                <div>
                  <p className="font-bold text-on-surface">Email officiel :</p>
                  <p className="text-on-surface-variant">{school.email}</p>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
