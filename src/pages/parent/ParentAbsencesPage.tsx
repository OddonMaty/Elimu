import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceService } from '../../services/api';
import { AttendanceRecord } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface ParentAbsencesPageProps {}

export const ParentAbsencesPage: React.FC<ParentAbsencesPageProps> = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await attendanceService.getStudentAttendance('stud-1');
      setRecords(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const absences = records.filter(r => r.status === 'ABSENT');
  const retards = records.filter(r => r.status === 'RETARD');
  const justifies = records.filter(r => r.status === 'JUSTIFIE');

  if (loading) return <LoadingSpinner message="Chargement du registre d'assiduité..." />;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Suivi de l'Assiduité & Gestion des Absences
          </h1>
          <p className="text-xs text-on-surface-variant">
            Historique complet des présences, retards et absences justifiées
          </p>
        </div>
        <Link to="/parent/absences/justify">
          <Button variant="accent" size="sm" icon="upload_file">
            Soumettre une Justification
          </Button>
        </Link>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-3 gap-4">
        <Card noPadding className="p-4 text-center border-l-4 border-l-error">
          <span className="text-2xl font-black text-error block">{absences.length}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Absences Non Justifiées</span>
        </Card>
        <Card noPadding className="p-4 text-center border-l-4 border-l-warning">
          <span className="text-2xl font-black text-warning block">{retards.length}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Retards Enregistrés</span>
        </Card>
        <Card noPadding className="p-4 text-center border-l-4 border-l-success">
          <span className="text-2xl font-black text-success block">{justifies.length}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Absences Justifiées</span>
        </Card>
      </div>

      {/* Attendance history */}
      <Card title="Historique de Présence — Semestre 1" subtitle="Relevé journalier des appels">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                <th className="p-3">Date</th>
                <th className="p-3">Classe</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-on-surface">{r.date}</td>
                  <td className="p-3 text-on-surface-variant">{r.className}</td>
                  <td className="p-3 text-center">
                    <Badge
                      variant={
                        r.status === 'PRESENT' ? 'success' :
                        r.status === 'ABSENT' ? 'error' :
                        r.status === 'RETARD' ? 'warning' : 'info'
                      }
                      size="sm"
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    {r.status === 'ABSENT' && (
                      <Link to="/parent/absences/justify">
                        <Button variant="outline" size="sm" icon="upload_file">
                          Justifier
                        </Button>
                      </Link>
                    )}
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
