import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApplicationDossier } from '../../types';
import { applicationService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface ApplicationsListPageProps {}

export const ApplicationsListPage: React.FC<ApplicationsListPageProps> = () => {
  const [applications, setApplications] = useState<ApplicationDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await applicationService.getApplications();
      setApplications(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = applications.filter(app => {
    const matchesSearch = `${app.applicantFirstName} ${app.applicantLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.targetClass.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Gestion des Candidatures & Inscriptions en Ligne
          </h1>
          <p className="text-xs text-on-surface-variant">
            Examen des dossiers scolaires, validation des pièces et attribution des places
          </p>
        </div>
        <Link to="/register-online">
          <Button variant="accent" size="sm" icon="add_circle">
            Saisir une Candidature Manuelle
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-4 bg-surface-container-lowest flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <Input
            placeholder="Rechercher par nom d'élève, parent, classe demandée..."
            icon="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            options={[
              { value: 'ALL', label: 'Tous les Statuts' },
              { value: 'SOUMIS', label: 'Soumis' },
              { value: 'EN_EXAMEN', label: 'En Examen' },
              { value: 'APPROUVE', label: 'Approuvé' },
              { value: 'REJETE', label: 'Rejeté' }
            ]}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          />
        </div>
      </Card>

      {/* Applications Table */}
      {loading ? (
        <LoadingSpinner message="Chargement des candidatures..." />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                  <th className="p-3.5">Candidat(e)</th>
                  <th className="p-3.5">Classe Demandée</th>
                  <th className="p-3.5">Parent / Contact</th>
                  <th className="p-3.5">Frais Dossier</th>
                  <th className="p-3.5">Date Dépôt</th>
                  <th className="p-3.5">Statut</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="p-3.5 font-bold text-primary">
                      {app.applicantLastName} {app.applicantFirstName} ({app.gender})
                      <span className="block text-[10px] text-on-surface-variant font-normal">Né(e) le {app.birthDate}</span>
                    </td>
                    <td className="p-3.5 font-medium text-on-surface">
                      {app.targetClass}
                      <span className="block text-[10px] text-on-surface-variant">{app.targetSection}</span>
                    </td>
                    <td className="p-3.5 text-on-surface">
                      <span className="font-semibold block">{app.parentName}</span>
                      <span className="text-[11px] text-on-surface-variant font-mono">{app.parentPhone}</span>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={app.registrationFeePaid ? 'success' : 'warning'} size="sm">
                        {app.registrationFeePaid ? 'Payé ($25)' : 'Non réglé'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-on-surface-variant font-mono">{app.submissionDate}</td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          app.status === 'APPROUVE' ? 'success' :
                          app.status === 'EN_EXAMEN' ? 'warning' :
                          app.status === 'REJETE' ? 'error' : 'info'
                        }
                        size="sm"
                        dot
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link to={`/direction/applications/${app.id}`}>
                        <Button variant="outline" size="sm" icon="visibility">
                          Examiner Dossier
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
