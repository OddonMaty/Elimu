import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { School } from '../../types';
import { schoolService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export interface SchoolComparatorPageProps {}

export const SchoolComparatorPage: React.FC<SchoolComparatorPageProps> = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['sch-1', 'sch-2', 'sch-3']);

  useEffect(() => {
    const fetch = async () => {
      const all = await schoolService.getSchools();
      setSchools(all);
    };
    fetch();
  }, []);

  const comparedSchools = schools.filter(s => selectedIds.includes(s.id));

  const toggleSchool = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 3) setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Badge variant="info" size="sm" icon="compare_arrows">
            Outil d'Orientation Pédagogique
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-1">
            Comparateur d’Écoles & Tarification RDC
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Analysez côte-à-côte les frais scolaires, les taux de réussite aux examens d'État et les infrastructures.
          </p>
        </div>

        {/* School selector buttons */}
        <div className="flex flex-wrap gap-2">
          {schools.map(s => {
            const isSelected = selectedIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSchool(s.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container'
                }`}
              >
                {isSelected ? '✓ ' : '+ '} {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 w-1/4 font-bold uppercase text-on-surface-variant tracking-wider">
                  Critères d'Évaluation
                </th>
                {comparedSchools.map(s => (
                  <th key={s.id} className="p-4 w-1/4 min-w-[240px] border-l border-outline-variant">
                    <div className="space-y-2">
                      <img
                        src={s.coverImage}
                        alt={s.name}
                        className="h-28 w-full object-cover rounded-md"
                      />
                      <h4 className="font-extrabold text-sm text-primary">{s.name}</h4>
                      <p className="text-[11px] text-on-surface-variant">{s.city} • {s.province}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              
              {/* Type */}
              <tr>
                <td className="p-4 font-bold text-on-surface bg-surface-container-low/40">Statut Institutionnel</td>
                {comparedSchools.map(s => (
                  <td key={s.id} className="p-4 border-l border-outline-variant">
                    <span className="font-semibold text-on-surface">{s.type}</span>
                  </td>
                ))}
              </tr>

              {/* Tuition */}
              <tr>
                <td className="p-4 font-bold text-on-surface bg-surface-container-low/40">Frais de Scolarité Annuels</td>
                {comparedSchools.map(s => (
                  <td key={s.id} className="p-4 border-l border-outline-variant">
                    <span className="text-base font-black text-primary">
                      ${s.annualTuitionMinUSD} - ${s.annualTuitionMaxUSD}
                    </span>
                    <span className="block text-[10px] text-on-surface-variant">Payable en 3 tranches</span>
                  </td>
                ))}
              </tr>

              {/* State Exam Pass Rate */}
              <tr>
                <td className="p-4 font-bold text-on-surface bg-surface-container-low/40">Réussite Examen d'État</td>
                {comparedSchools.map(s => (
                  <td key={s.id} className="p-4 border-l border-outline-variant">
                    <Badge variant="warning" size="md" icon="workspace_premium">
                      {s.passRateStateExam}% de réussite
                    </Badge>
                  </td>
                ))}
              </tr>

              {/* Options */}
              <tr>
                <td className="p-4 font-bold text-on-surface bg-surface-container-low/40">Options & Humanités</td>
                {comparedSchools.map(s => (
                  <td key={s.id} className="p-4 border-l border-outline-variant space-y-1">
                    {s.sections.map((sec, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-on-surface">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        <span>{sec}</span>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Infrastructure */}
              <tr>
                <td className="p-4 font-bold text-on-surface bg-surface-container-low/40">Infrastructures Clés</td>
                {comparedSchools.map(s => (
                  <td key={s.id} className="p-4 border-l border-outline-variant space-y-1">
                    {s.infrastructure.slice(0, 4).map((inf, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-success text-sm">check</span>
                        <span>{inf}</span>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr className="bg-surface-container-low/30">
                <td className="p-4 font-bold text-on-surface">Démarche d'Inscription</td>
                {comparedSchools.map(s => (
                  <td key={s.id} className="p-4 border-l border-outline-variant">
                    <Link to={`/register?schoolId=${s.id}`}>
                      <Button variant="accent" size="sm" fullWidth icon="how_to_reg">
                        Postuler à cette École
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
