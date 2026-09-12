import React, { useState, useEffect } from 'react';
import { classService } from '../../services/api';
import { ClassSection } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';

export interface ClassesConfigPageProps {}

export const ClassesConfigPage: React.FC<ClassesConfigPageProps> = () => {
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newLevel, setNewLevel] = useState<'Secondaire' | 'Humanités'>('Humanités');
  const [newStream, setNewStream] = useState('Scientifique');
  const [newCapacity, setNewCapacity] = useState('40');
  const [newRoom, setNewRoom] = useState('Bâtiment B - Salle 16');
  const [newTeacher, setNewTeacher] = useState('M. Jean-Paul Kasongo');
  const { notify } = useNotification();

  useEffect(() => {
    const fetch = async () => {
      const data = await classService.getClasses();
      setClasses(data);
    };
    fetch();
  }, []);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    const created: ClassSection = {
      id: `cls-${Date.now()}`,
      name: newClassName,
      level: newLevel,
      stream: newStream as any,
      capacity: parseInt(newCapacity) || 40,
      enrolled: 0,
      room: newRoom,
      mainTeacher: newTeacher
    };

    setClasses(prev => [...prev, created]);
    setIsModalOpen(false);
    notify('success', 'Classe Créée !', `La classe ${newClassName} a été ajoutée à la structure pédagogique.`);
    setNewClassName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Configuration & Répartition des Classes
          </h1>
          <p className="text-xs text-on-surface-variant">
            Structure pédagogique, attribution des salles de cours et désignation des professeurs titulaires
          </p>
        </div>
        <Button variant="accent" size="sm" icon="add" onClick={() => setIsModalOpen(true)}>
          Créer une Nouvelle Classe
        </Button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map(cls => {
          const occupancyRate = Math.round((cls.enrolled / cls.capacity) * 100);
          return (
            <Card key={cls.id} noPadding className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-primary">{cls.name}</h3>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {cls.level} {cls.stream ? `• ${cls.stream}` : ''}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary-fixed text-primary">
                    {cls.room}
                  </span>
                </div>

                {/* Capacity progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface-variant">Effectif :</span>
                    <span className="text-primary font-bold">{cls.enrolled} / {cls.capacity} élèves</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyRate >= 95 ? 'bg-error' : occupancyRate >= 80 ? 'bg-secondary-container' : 'bg-primary'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Main Teacher */}
                <div className="pt-3 border-t border-outline-variant/60 flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-primary text-base">person</span>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block uppercase font-semibold">Professeur Titulaire</span>
                    <span className="font-bold text-on-surface">{cls.mainTeacher}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2 border-t border-outline-variant/50 mt-4">
                <Button variant="outline" size="sm" fullWidth icon="edit">
                  Modifier
                </Button>
                <Button variant="ghost" size="sm" icon="schedule" title="Voir l'emploi du temps">
                  Horaire
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal New Class */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter une Nouvelle Classe"
        subtitle="Définissez les paramètres de la division scolaire"
      >
        <form onSubmit={handleAddClass} className="space-y-4">
          <Input
            label="Intitulé de la classe *"
            placeholder="ex: 4ème Scientifique C"
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Niveau *"
              options={['Primaire', 'Secondaire', 'Humanités']}
              value={newLevel}
              onChange={e => setNewLevel(e.target.value as any)}
            />
            <Select
              label="Section / Filière *"
              options={['Scientifique', 'Littéraire', 'Commerciale & Gestion', 'Pédagogie Générale', 'Technique']}
              value={newStream}
              onChange={e => setNewStream(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Capacité Max *"
              type="number"
              value={newCapacity}
              onChange={e => setNewCapacity(e.target.value)}
              required
            />
            <Input
              label="Salle Affectée *"
              value={newRoom}
              onChange={e => setNewRoom(e.target.value)}
              required
            />
          </div>

          <Input
            label="Professeur Titulaire"
            value={newTeacher}
            onChange={e => setNewTeacher(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" icon="add_circle">
              Créer la Classe
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
