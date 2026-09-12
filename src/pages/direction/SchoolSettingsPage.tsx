import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';
import { schoolService } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface SchoolSettingsPageProps {}

export const SchoolSettingsPage: React.FC<SchoolSettingsPageProps> = () => {
  const { notify } = useNotification();

  const [name, setName] = useState('Collège Boboto');
  const [motto, setMotto] = useState('Excellence, Rigueur et Formation Intégrale depuis 1937');
  const [address, setAddress] = useState('Avenue Père Boka n°9, Gombe, Kinshasa');
  const [phone, setPhone] = useState('+243 81 700 1937');
  const [email, setEmail] = useState('contact@collegeboboto.cd');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [currentTerm, setCurrentTerm] = useState('Semestre 1');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const school = await schoolService.getMySchool();
        if (school) {
          setName(school.name || '');
          setMotto(school.tagline || '');
          setAddress(school.address || '');
          setPhone(school.phone || '');
          setEmail(school.email || '');
          if (school.currentAcademicYear) setAcademicYear(school.currentAcademicYear);
          if (school.currentTerm) setCurrentTerm(school.currentTerm);
        }
      } catch (err: any) {
        notify('error', 'Erreur', err.message || 'Impossible de charger les paramètres.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchool();
  }, [notify]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await schoolService.updateMySchool({
        name,
        tagline: motto,
        address,
        phone,
        email,
        currentAcademicYear: academicYear,
        currentTerm
      });
      notify('success', 'Paramètres Sauvegardés', 'Les modifications de l’établissement ont été enregistrées.');
    } catch (err: any) {
      notify('error', 'Erreur', err.message || 'Échec de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement des paramètres..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Paramètres Généraux de l’Établissement
        </h1>
        <p className="text-xs text-on-surface-variant">
          Identité institutionnelle, calendrier scolaire et coordonnées officielles
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Identité de l'École & Agrément">
          <div className="space-y-4">
            <Input
              label="Nom Officiel de l’Établissement"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Devise Institutionnelle"
              value={motto}
              onChange={e => setMotto(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Adresse Physique Complète"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <Input
                label="Numéro de Téléphone Officiel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <Input
              label="Adresse Email de Contact"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </Card>

        <Card title="Configuration de l'Année Scolaire & Périodes">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Année Scolaire Active"
              options={['2025 - 2026', '2026 - 2027']}
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
            />
            <Select
              label="Période / Semestre en Cours"
              options={['Semestre 1 (1ère & 2ème Période)', 'Semestre 2 (3ème & 4ème Période)', 'Délibérations Annuelles']}
              value={currentTerm}
              onChange={e => setCurrentTerm(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="accent" size="lg" type="submit" isLoading={isSaving} icon="save">
            Enregistrer les Modifications
          </Button>
        </div>
      </form>
    </div>
  );
};
