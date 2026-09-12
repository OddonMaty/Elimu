import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';

export interface SchoolOptionsPageProps {}

interface OptionItem {
  id: string;
  name: string;
  code: string;
  category: string;
  coursesCount: number;
  active: boolean;
}

export const SchoolOptionsPage: React.FC<SchoolOptionsPageProps> = () => {
  const { notify } = useNotification();
  const [options, setOptions] = useState<OptionItem[]>([
    { id: 'opt-1', name: 'Scientifique : Biologie & Chimie (Bio-Chimie)', code: 'SC-BC', category: 'Humanités Scientifiques', coursesCount: 14, active: true },
    { id: 'opt-2', name: 'Scientifique : Mathématiques & Physique (Math-Physique)', code: 'SC-MP', category: 'Humanités Scientifiques', coursesCount: 14, active: true },
    { id: 'opt-3', name: 'Littéraire : Latin & Philosophie (Latin-Philo)', code: 'LIT-LP', category: 'Humanités Littéraires', coursesCount: 12, active: true },
    { id: 'opt-4', name: 'Commerciale & Gestion Informatique', code: 'COM-GI', category: 'Humanités Techniques & Commerciales', coursesCount: 15, active: true },
    { id: 'opt-5', name: 'Pédagogie Générale', code: 'PED-GEN', category: 'Humanités Pédagogiques', coursesCount: 13, active: false },
  ]);

  const toggleOption = (id: string) => {
    setOptions(prev => prev.map(o => {
      if (o.id === id) {
        const next = !o.active;
        notify('info', 'Filière mise à jour', `L'option ${o.name} est maintenant ${next ? 'active' : 'désactivée'}.`);
        return { ...o, active: next };
      }
      return o;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Configuration des Options & Filières Scolaires
          </h1>
          <p className="text-xs text-on-surface-variant">
            Programmes officiels d'enseignement secondaire et humanités homologués en RDC
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {options.map(opt => (
          <Card key={opt.id} noPadding className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                {opt.code}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-primary">{opt.name}</h3>
                  <Badge variant={opt.active ? 'success' : 'neutral'} size="sm">
                    {opt.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant">{opt.category} • {opt.coursesCount} cours avec pondérations EPST</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant={opt.active ? 'outline' : 'primary'}
                size="sm"
                onClick={() => toggleOption(opt.id)}
              >
                {opt.active ? 'Désactiver' : 'Activer'}
              </Button>
              <Button variant="ghost" size="sm" icon="tune">
                Pondérations
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
