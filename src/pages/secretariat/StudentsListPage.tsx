import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/api';
import { Student } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface StudentsListPageProps {}

export const StudentsListPage: React.FC<StudentsListPageProps> = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await studentService.getStudents();
      setStudents(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName} ${s.middleName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Registre Matricule & Gestion des Élèves
          </h1>
          <p className="text-xs text-on-surface-variant">
            Fichier central des inscriptions scolaires, matricules officiels et coordonnées parentales
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/secretariat/id-cards">
            <Button variant="outline" size="sm" icon="badge">
              Imprimer Cartes d'Identité
            </Button>
          </Link>
          <Link to="/secretariat/enrollment">
            <Button variant="accent" size="sm" icon="person_add">
              Nouvel Élève
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card noPadding className="p-4 bg-surface-container-lowest flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <Input
            placeholder="Rechercher par nom, matricule (ex: ELM-2025-0842), parent..."
            icon="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            options={[
              { value: 'ALL', label: 'Toutes les Classes' },
              { value: '4ème Scientifique A', label: '4ème Scientifique A' },
              { value: '4ème Scientifique B', label: '4ème Scientifique B' },
              { value: '1ère Humanités B', label: '1ère Humanités B' }
            ]}
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          />
        </div>
      </Card>

      {/* Main Student Registry Table */}
      {loading ? (
        <LoadingSpinner message="Chargement du registre des élèves..." />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                  <th className="p-3.5">Élève & Photo</th>
                  <th className="p-3.5">Matricule</th>
                  <th className="p-3.5">Classe & Section</th>
                  <th className="p-3.5">Parent / Contact</th>
                  <th className="p-3.5">Moyenne</th>
                  <th className="p-3.5">Frais Scolaires</th>
                  <th className="p-3.5">Statut</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredStudents.map(st => (
                  <tr key={st.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={st.photoUrl}
                        alt={st.firstName}
                        className="w-10 h-10 rounded-full object-cover border border-outline-variant"
                      />
                      <div>
                        <span className="font-bold text-sm text-primary block">
                          {st.lastName} {st.firstName}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {st.gender === 'M' ? 'Garçon' : 'Fille'} • Né(e) le {st.birthDate}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-primary">{st.matricule}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-on-surface block">{st.className}</span>
                      <span className="text-[10px] text-on-surface-variant">{st.section}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-on-surface block">{st.parentName}</span>
                      <span className="text-[11px] font-mono text-on-surface-variant">{st.parentPhone}</span>
                    </td>
                    <td className="p-3.5 font-black text-sm text-primary">
                      {st.overallAverage > 0 ? `${st.overallAverage}%` : '-'}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          st.tuitionStatus === 'Payé' ? 'success' :
                          st.tuitionStatus === 'Tranche 2' ? 'warning' :
                          st.tuitionStatus === 'Tranche 1' ? 'warning' : 'error'
                        }
                        size="sm"
                      >
                        {st.tuitionStatus}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="success" size="sm" dot>
                        {st.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link to="/parent/bulletin/official">
                        <Button variant="outline" size="sm" icon="description">
                          Bulletin
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
