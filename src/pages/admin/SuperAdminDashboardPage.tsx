import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export interface SuperAdminDashboardPageProps {}

const SCHOOLS = [
  {
    id: 'sch-1',
    name: 'Collège Boboto',
    city: 'Kinshasa, Gombe',
    students: 524,
    plan: 'PREMIUM',
    status: 'ACTIF',
    revenue: 1450
  },
  {
    id: 'sch-2',
    name: 'Complexe Scolaire Cardinal Malula',
    city: 'Kinshasa, Kalamu',
    students: 1204,
    plan: 'ENTERPRISE',
    status: 'ACTIF',
    revenue: 3820
  },
  {
    id: 'sch-3',
    name: 'Lycée Liziba',
    city: 'Kinshasa, Ngaliema',
    students: 380,
    plan: 'STARTER',
    status: 'ACTIF',
    revenue: 760
  },
  {
    id: 'sch-4',
    name: 'Institut Technique de Goma',
    city: 'Goma, Nord-Kivu',
    students: 290,
    plan: 'STARTER',
    status: 'INACTIF',
    revenue: 0
  },
  {
    id: 'sch-5',
    name: 'Collège Imara',
    city: 'Lubumbashi, Katanga',
    students: 845,
    plan: 'PREMIUM',
    status: 'ACTIF',
    revenue: 2200
  }
];

export const SuperAdminDashboardPage: React.FC<SuperAdminDashboardPageProps> = () => {
  const totalStudents = SCHOOLS.reduce((s, sch) => s + sch.students, 0);
  const totalRevenue = SCHOOLS.reduce((s, sch) => s + sch.revenue, 0);
  const activeSchools = SCHOOLS.filter(s => s.status === 'ACTIF').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Super Admin Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#0d1e35] text-white p-6 shadow-xl">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">SuperAdmin — Plateforme Elimu SaaS</p>
          <h1 className="text-3xl font-black mt-1">Tableau de Bord Global</h1>
          <p className="text-sm text-white/70 mt-1">
            Réseau de {SCHOOLS.length} établissements partenaires — République Démocratique du Congo
          </p>
        </div>
        <div className="absolute right-6 top-4 opacity-10">
          <span className="material-symbols-outlined text-[150px]">analytics</span>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card noPadding className="p-4 text-center border-l-4 border-l-primary bg-surface-container-lowest">
          <span className="text-3xl font-black text-primary block">{SCHOOLS.length}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block mt-1">Établissements</span>
          <span className="text-[10px] text-on-surface-variant">{activeSchools} actifs</span>
        </Card>
        <Card noPadding className="p-4 text-center border-l-4 border-l-secondary-container bg-surface-container-lowest">
          <span className="text-3xl font-black text-primary block">{totalStudents.toLocaleString()}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block mt-1">Élèves Inscrits</span>
          <span className="text-[10px] text-success">+12.4% vs A.S. précédente</span>
        </Card>
        <Card noPadding className="p-4 text-center border-l-4 border-l-success bg-surface-container-lowest">
          <span className="text-3xl font-black text-success block">${totalRevenue.toLocaleString()}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block mt-1">ARR SaaS (USD)</span>
          <span className="text-[10px] text-on-surface-variant">Revenu mensuel récurrent</span>
        </Card>
        <Card noPadding className="p-4 text-center border-l-4 border-l-warning bg-surface-container-lowest">
          <span className="text-3xl font-black text-primary block">99.1%</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block mt-1">Uptime Plateforme</span>
          <span className="text-[10px] text-success">Disponibilité SLA 99%</span>
        </Card>
      </div>

      {/* Schools Grid */}
      <Card title="Réseau des Établissements Partenaires" subtitle="Gestion des licences et accès">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                <th className="p-3">Établissement</th>
                <th className="p-3">Ville</th>
                <th className="p-3 text-center">Élèves</th>
                <th className="p-3 text-center">Plan SaaS</th>
                <th className="p-3 text-center">ARR (USD)</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {SCHOOLS.map(sch => (
                <tr key={sch.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-primary block">{sch.name}</span>
                  </td>
                  <td className="p-3 text-on-surface-variant">{sch.city}</td>
                  <td className="p-3 text-center font-bold text-on-surface">{sch.students}</td>
                  <td className="p-3 text-center">
                    <Badge
                      variant={sch.plan === 'ENTERPRISE' ? 'primary' : sch.plan === 'PREMIUM' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {sch.plan}
                    </Badge>
                  </td>
                  <td className="p-3 text-center font-bold text-primary">${sch.revenue}</td>
                  <td className="p-3 text-center">
                    <Badge variant={sch.status === 'ACTIF' ? 'success' : 'error'} size="sm" dot>
                      {sch.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Link to="/admin/plan">
                      <Button variant="ghost" size="sm" icon="manage_accounts">
                        Gérer
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
