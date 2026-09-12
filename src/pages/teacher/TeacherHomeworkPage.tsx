import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeworkService } from '../../services/api';
import { Homework } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface TeacherHomeworkPageProps {}

export const TeacherHomeworkPage: React.FC<TeacherHomeworkPageProps> = () => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await homeworkService.getHomeworks(selectedClass);
      setHomeworks(data);
      setLoading(false);
    };
    fetch();
  }, [selectedClass]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Cahier de Textes & Suivi des Devoirs
          </h1>
          <p className="text-xs text-on-surface-variant">
            Devoirs assignés, dates de remise et notifications automatiques aux élèves et parents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/teacher/homework/new">
            <Button variant="accent" size="sm" icon="add_task">
              Créer un Nouveau Devoir
            </Button>
          </Link>
        </div>
      </div>

      <Card noPadding className="p-4 bg-surface-container-lowest flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-on-surface-variant">Filtrer par classe :</span>
        <div className="w-64">
          <Select
            options={[
              { value: 'ALL', label: 'Toutes mes classes' },
              { value: '4ème Scientifique A', label: '4ème Scientifique A' },
              { value: '4ème Scientifique B', label: '4ème Scientifique B' }
            ]}
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner message="Chargement des devoirs..." />
      ) : (
        <div className="space-y-4">
          {homeworks.map(hw => (
            <Card key={hw.id} noPadding className="p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="primary" size="sm">
                      {hw.subject}
                    </Badge>
                    <span className="text-xs font-bold text-on-surface">{hw.className}</span>
                    <span className="text-xs text-on-surface-variant">• Assigné le {hw.assignedDate}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-primary">{hw.title}</h3>
                  <p className="text-xs text-on-surface leading-relaxed">{hw.instructions}</p>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  <Badge variant="warning" size="md" icon="event">
                    À rendre pour le {hw.dueDate}
                  </Badge>
                  <span className="text-xs text-on-surface-variant font-medium">Barème : / {hw.maxScore || 20} pts</span>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" icon="edit">
                      Modifier
                    </Button>
                    <Button variant="ghost" size="sm" icon="grade">
                      Corriger
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
