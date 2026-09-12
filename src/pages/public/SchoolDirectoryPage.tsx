import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { School } from '../../types';
import { schoolService } from '../../services/api';
import { RDC_26_PROVINCES } from '../../data/rdcGeography';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface SchoolDirectoryPageProps {}

export const SchoolDirectoryPage: React.FC<SchoolDirectoryPageProps> = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [maxTuition, setMaxTuition] = useState('ALL');

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      const data = await schoolService.getSchools();
      setSchools(data);
      setLoading(false);
    };
    fetchSchools();
  }, []);

  const filteredSchools = schools.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sections.some(sec => sec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProvince = selectedProvince === 'ALL' || s.province.toLowerCase().includes(selectedProvince.toLowerCase()) || s.city.toLowerCase().includes(selectedProvince.toLowerCase());
    const matchesType = selectedType === 'ALL' || s.type === selectedType;
    
    let matchesTuition = true;
    if (maxTuition === 'UNDER_400') matchesTuition = s.annualTuitionMinUSD <= 400;
    if (maxTuition === '400_700') matchesTuition = s.annualTuitionMinUSD >= 400 && s.annualTuitionMaxUSD <= 700;
    if (maxTuition === 'OVER_700') matchesTuition = s.annualTuitionMaxUSD > 700;

    return matchesSearch && matchesProvince && matchesType && matchesTuition;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary via-primary-container to-tertiary text-white py-14 px-6 sm:px-12 rounded-2xl overflow-hidden shadow-xl border border-primary">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <Badge variant="warning" size="md" icon="verified">
            Annuaire National • 26 Provinces de la RDC
          </Badge>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Trouvez la Meilleure École pour Vos Enfants en RDC
          </h1>
          
          <p className="text-sm sm:text-base text-on-primary-container leading-relaxed max-w-2xl">
            Explorez les collèges, lycées et complexes scolaires à Kinshasa, Lubumbashi, Goma, Matadi, Kisangani, Bukavu et dans l'ensemble des 26 provinces. Frais transparents, taux de réussite à l’Examen d'État et candidatures en ligne.
          </p>

          {/* Search bar within hero */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par école, province (ex: Haut-Katanga), section (ex: Bio-Chimie)..."
                icon="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white text-black h-12 shadow-sm"
              />
            </div>
            <Link to="/compare">
              <Button variant="accent" size="lg" icon="compare" className="h-12 w-full sm:w-auto font-bold">
                Comparer les Écoles
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="material-symbols-outlined text-on-surface-variant">tune</span>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Filtres Rapides :</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-3xl">
          <Select
            options={[
              { value: 'ALL', label: 'Toutes les 26 Provinces' },
              ...RDC_26_PROVINCES.map(p => ({
                value: p.name,
                label: `${p.name} (${p.capital})`
              }))
            ]}
            value={selectedProvince}
            onChange={e => setSelectedProvince(e.target.value)}
          />

          <Select
            options={[
              { value: 'ALL', label: 'Tous les Statuts Juridiques' },
              { value: 'Public Conventionné', label: 'Conventionné Catholique / Salésien' },
              { value: 'Privé', label: 'Établissement Privé Homologué' }
            ]}
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          />

          <Select
            options={[
              { value: 'ALL', label: 'Tous les Tarifs' },
              { value: 'UNDER_400', label: 'Moins de $400 / an' },
              { value: '400_700', label: '$400 - $700 / an' },
              { value: 'OVER_700', label: 'Plus de $700 / an' }
            ]}
            value={maxTuition}
            onChange={e => setMaxTuition(e.target.value)}
          />
        </div>

        <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
          {filteredSchools.length} école{filteredSchools.length > 1 ? 's' : ''} trouvée{filteredSchools.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* School Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Chargement des établissements scolaires de la RDC..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map(school => (
            <Card
              key={school.id}
              noPadding
              className="group hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* School Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                  <img
                    src={school.coverImage}
                    alt={school.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                      {school.province} • {school.city}
                    </span>
                    {school.featured && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-secondary-container text-primary uppercase tracking-wider shadow-xs">
                        ★ Référence
                      </span>
                    )}
                  </div>

                  {/* Exetat pass rate */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow">
                      <img src={school.logoImage} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow">
                      Exetat : <span className="text-secondary-container font-black">{school.passRateStateExam}%</span>
                    </span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-primary group-hover:text-tertiary transition-colors">
                      {school.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                      {school.tagline}
                    </p>
                  </div>

                  {/* Sections pill tags */}
                  <div className="flex flex-wrap gap-1">
                    {school.sections.slice(0, 3).map((sec, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-surface-container font-medium text-on-surface-variant"
                      >
                        {sec}
                      </span>
                    ))}
                    {school.sections.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high font-bold text-on-surface-variant">
                        +{school.sections.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Tuition info */}
                  <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                        Frais Scolaires Annuels :
                      </span>
                      <span className="text-sm font-black text-primary">
                        ${school.annualTuitionMinUSD} - ${school.annualTuitionMaxUSD} USD
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                        Effectif :
                      </span>
                      <span className="text-xs font-bold text-on-surface">
                        {school.studentCount} élèves
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 flex gap-2">
                <Link to={`/schools/${school.id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth icon="visibility">
                    Détails
                  </Button>
                </Link>
                <Link to={`/register?schoolId=${school.id}`} className="flex-1">
                  <Button variant="accent" size="sm" fullWidth icon="send">
                    Postuler
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
