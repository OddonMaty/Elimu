import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';

export interface AbsenceJustificationPageProps {}

export const AbsenceJustificationPage: React.FC<AbsenceJustificationPageProps> = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [absenceDate, setAbsenceDate] = useState('');
  const [reason, setReason] = useState('Maladie (Certificat Médical)');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceDate || !details) {
      notify('error', 'Champs requis', 'Veuillez compléter tous les champs.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      notify('success', 'Justification Soumise !', 'Votre demande de justification d\'absence a été transmise au secrétariat pour examen. Vous recevrez une confirmation sous 24h.');
      navigate('/parent/absences');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Soumettre une Justification d'Absence
        </h1>
        <p className="text-xs text-on-surface-variant">
          Formulaire officiel de justification transmis au secrétariat scolaire pour archivage
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Détails de l'Absence à Justifier">
          <div className="space-y-4">
            <Input
              label="Date de l'Absence *"
              type="date"
              value={absenceDate}
              onChange={e => setAbsenceDate(e.target.value)}
              required
            />

            <Select
              label="Motif de l'Absence *"
              options={[
                'Maladie (Certificat Médical)',
                'Décès dans la famille (Acte de décès)',
                'Convocation officielle ou judiciaire',
                'Raison familiale grave',
                'Cas de force majeure',
                'Autre motif'
              ]}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                Explication Détaillée & Justificatif *
              </label>
              <textarea
                className="w-full h-28 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Décrivez les circonstances de l'absence. Mentionnez le document justificatif remis en main propre au secrétariat (certificat médical, acte de décès, etc.)..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/parent/absences')}>
            Annuler
          </Button>
          <Button variant="primary" size="lg" type="submit" isLoading={isSubmitting} icon="send">
            Soumettre au Secrétariat
          </Button>
        </div>
      </form>
    </div>
  );
};
