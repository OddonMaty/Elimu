import React, { useEffect, useState } from 'react';
import { homeworkService } from '../../services/api';
import { Homework } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface ParentHomeworkPageProps {}

export const ParentHomeworkPage: React.FC<ParentHomeworkPageProps> = () => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await homeworkService.getHomeworks('ALL');
      setHomeworks(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="Chargement des devoirs..." />;

  const today = new Date();

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Cahier de Textes — Devoirs & Travaux à Domicile
        </h1>
        <p className="text-xs text-on-surface-variant">
          Tous les travaux assignés par les professeurs à votre enfant
        </p>
      </div>

      <div className="space-y-4">
        {homeworks.map(hw => {
          const due = new Date(hw.dueDate);
          const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
          const isOverdue = daysLeft < 0;
          const isUrgent = daysLeft >= 0 && daysLeft <= 2;

          return (
            <Card key={hw.id} noPadding className={`p-5 border-l-4 ${
              isOverdue ? 'border-l-error' : isUrgent ? 'border-l-warning' : 'border-l-primary'
            }`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary" size="sm">{hw.subject}</Badge>
                    {hw.submissionStatus && (
                      <Badge variant={hw.submissionStatus === 'RENDU' ? 'success' : 'warning'} size="sm">
                        {hw.submissionStatus}
                      </Badge>
                    )}
                    <span className="text-xs text-on-surface-variant">Assigné le {hw.assignedDate}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-primary">{hw.title}</h3>
                  <p className="text-xs text-on-surface leading-relaxed">{hw.instructions}</p>

                  <div className="text-xs text-on-surface-variant">
                    <strong>Barème :</strong> /{hw.maxScore || 20} pts •
                    <strong> Professeur :</strong> {hw.teacherName}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  <Badge
                    variant={isOverdue ? 'error' : isUrgent ? 'warning' : 'success'}
                    size="md"
                    icon="event"
                  >
                    {isOverdue
                      ? `Délai Dépassé (${Math.abs(daysLeft)}j)`
                      : isUrgent
                      ? `Urgent ! ${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`
                      : `${daysLeft} jours restants`
                    }
                  </Badge>
                  <span className="text-xs font-mono font-bold text-on-surface-variant">
                    À rendre le {hw.dueDate}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
