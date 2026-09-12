import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeworkService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';

export interface CreateHomeworkPageProps {}

export const CreateHomeworkPage: React.FC<CreateHomeworkPageProps> = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Chimie Organique & Inorganique');
  const [className, setClassName] = useState('4ème Scientifique A');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !instructions || !dueDate) {
      notify('error', 'Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      await homeworkService.createHomework({
        title,
        subject,
        className,
        instructions,
        dueDate,
        maxScore: parseInt(maxScore) || 20,
        submissionStatus: 'A_FAIRE',
        assignedDate: new Date().toISOString().split('T')[0],
        teacherName: 'Prof. Jean-Paul Kasongo',
        teacherId: 'teacher-1'
      });

      notify('success', 'Devoir Créé !', `Le devoir "${title}" a été publié. Les parents ont reçu une notification automatique.`);
      navigate('/teacher/homework');
    } catch {
      notify('error', 'Erreur', 'Impossible de créer le devoir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Créer un Nouveau Devoir / Travail à Domicile
        </h1>
        <p className="text-xs text-on-surface-variant">
          Assignez un travail et notifiez automatiquement les élèves et leurs parents via SMS/WhatsApp
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Détails du Devoir Assigné">
          <div className="space-y-4">
            <Input
              label="Titre du Travail / Sujet *"
              placeholder="ex: Exercices de Nomenclature des Alcanes (p. 47-50)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Matière *"
                options={[
                  'Chimie Organique & Inorganique',
                  'Mathématiques Générales',
                  'Physique & Mécanique',
                  'Biologie & Anatomie',
                  'Français & Littérature',
                  'Anglais'
                ]}
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
              <Select
                label="Classe Destinataire *"
                options={[
                  '4ème Scientifique A',
                  '4ème Scientifique B',
                  '1ère Humanités B'
                ]}
                value={className}
                onChange={e => setClassName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date de Remise *"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
              <Input
                label="Barème Maximum (pts) *"
                type="number"
                value={maxScore}
                onChange={e => setMaxScore(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                Instructions Détaillées & Consignes *
              </label>
              <textarea
                className="w-full h-32 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Décrivez les exercices à réaliser, les chapitres à réviser, le matériel nécessaire, le format de rendu..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/teacher/homework')}>
            Annuler
          </Button>
          <Button variant="accent" size="lg" type="submit" isLoading={isSubmitting} icon="send">
            Publier & Notifier les Parents
          </Button>
        </div>
      </form>
    </div>
  );
};
