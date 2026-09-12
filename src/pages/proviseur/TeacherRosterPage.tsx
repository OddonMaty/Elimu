import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { useNotification } from '../../context/NotificationContext';
import { staffService } from '../../services/api';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const TeacherRosterPage: React.FC = () => {
  const { notify } = useNotification();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await staffService.getTeachers();
        setTeachers(data);
      } catch (err: any) {
        notify('error', 'Erreur', err.message || 'Impossible de charger le corps professoral.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [notify]);

  if (loading) return <LoadingSpinner message="Chargement des enseignants..." />;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Corps Professoral & Assiduité
        </h1>
        <p className="text-xs text-on-surface-variant">
          Tableau de bord du Proviseur : Suivi des enseignants, présences et affectations.
        </p>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                <th className="p-4">Nom de l'Enseignant</th>
                <th className="p-4">Email / Contact</th>
                <th className="p-4">Statut (Aujourd'hui)</th>
                <th className="p-4">Classes Assignées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {teachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4 font-semibold text-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      {teacher.name}
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">
                    {teacher.email}
                    {teacher.phone && <div className="text-[10px]">{teacher.phone}</div>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success-container/50 text-success text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                      Présent
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                        teacher.assignedClasses.map((cls, idx) => (
                          <span key={idx} className="bg-surface-container px-2 py-0.5 rounded text-[10px] border border-outline-variant">
                            {cls}
                          </span>
                        ))
                      ) : (
                        <span className="text-on-surface-variant italic text-[11px]">Non assigné</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                    Aucun enseignant trouvé pour cet établissement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
