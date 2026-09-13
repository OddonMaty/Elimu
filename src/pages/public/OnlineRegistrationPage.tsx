import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { School } from '../../types';
import { schoolService } from '../../services/api';
import { applicationService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

export interface OnlineRegistrationPageProps {}

export const OnlineRegistrationPage: React.FC<OnlineRegistrationPageProps> = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const preselectedSchoolId = searchParams.get('schoolId') || '';

  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  const [step, setStep] = useState(1);
  const [targetSchoolId, setTargetSchoolId] = useState(preselectedSchoolId);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [birthDate, setBirthDate] = useState('2010-05-15');
  const [targetClass, setTargetClass] = useState('4ème Scientifique');
  const [targetSection, setTargetSection] = useState('Scientifique (Bio-Chimie)');
  const [previousSchool, setPreviousSchool] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+243 ');
  const [parentEmail, setParentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoadingSchools(true);
      const data = await schoolService.getSchools();
      setSchools(data);
      // If there's a preselected schoolId from URL and it exists in the data, keep it;
      // otherwise default to the first school.
      if (preselectedSchoolId && data.some(s => s.id === preselectedSchoolId)) {
        setTargetSchoolId(preselectedSchoolId);
      } else if (data.length > 0) {
        setTargetSchoolId(data[0].id);
      }
      setLoadingSchools(false);
    };
    fetchSchools();
  }, [preselectedSchoolId]);

  const selectedSchool = schools.find(s => s.id === targetSchoolId) || schools[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !parentName || !parentPhone) {
      notify('error', 'Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      const app = await applicationService.submitApplication({
        applicantFirstName: firstName,
        applicantLastName: lastName,
        gender,
        birthDate,
        targetSchoolId: selectedSchool.id,
        targetSchoolName: selectedSchool.name,
        targetClass,
        targetSection,
        previousSchool: previousSchool || 'École précédente non spécifiée',
        parentName,
        parentPhone,
        parentEmail: parentEmail || 'non_renseigne@elimu.cd',
        registrationFeePaid: false,
        documents: [
          { name: 'Acte de Naissance', status: 'VALIDE' },
          { name: 'Bulletins Scolaires Antérieurs', status: 'VALIDE' }
        ]
      });

      notify('success', 'Dossier Enregistré !', `Votre candidature #${app.id} a été transmise à la direction.`);
      navigate(`/register/payment?appId=${app.id}`);
    } catch {
      notify('error', 'Erreur', 'Impossible de soumettre la candidature.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSchools) {
    return <LoadingSpinner message="Chargement des établissements disponibles..." />;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 pb-20 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-primary tracking-tight">
          Formulaire d'Admission & Inscription en Ligne
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto">
          Déposez votre dossier de candidature officiel auprès des collèges et lycées partenaires du réseau Elimu RDC.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm text-xs">
        <div className={`flex items-center gap-2 font-bold ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
            1
          </div>
          <span>Informations Élève</span>
        </div>
        <div className="h-0.5 w-12 bg-outline-variant hidden sm:block" />
        <div className={`flex items-center gap-2 font-bold ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
            2
          </div>
          <span>Parents & Contact</span>
        </div>
        <div className="h-0.5 w-12 bg-outline-variant hidden sm:block" />
        <div className={`flex items-center gap-2 font-bold ${step >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
            3
          </div>
          <span>Pièces & Validation</span>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-primary border-b pb-2">1. Choix de l'École & Identité de l'Élève</h3>
              
              <Select
                label="Établissement Souhaité *"
                options={schools.map(s => ({ value: s.id, label: `${s.name} (${s.city} - ${s.province})` }))}
                value={targetSchoolId}
                onChange={e => setTargetSchoolId(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom de l'élève *"
                  placeholder="ex: KASONGO"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
                <Input
                  label="Prénom(s) *"
                  placeholder="ex: Jonathan"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Genre *"
                  options={[{ value: 'M', label: 'Masculin (M)' }, { value: 'F', label: 'Féminin (F)' }]}
                  value={gender}
                  onChange={e => setGender(e.target.value as 'M' | 'F')}
                />
                <Input
                  label="Date de Naissance *"
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  required
                />
                <Select
                  label="Classe Demandée *"
                  options={[
                    '1ère Humanités (7ème EB)',
                    '2ème Humanités (8ème EB)',
                    '3ème Scientifique',
                    '4ème Scientifique',
                    '3ème Littéraire',
                    '4ème Littéraire',
                    '3ème Commerciale',
                    '4ème Commerciale'
                  ]}
                  value={targetClass}
                  onChange={e => setTargetClass(e.target.value)}
                />
              </div>

              <Input
                label="École de Provenance"
                placeholder="ex: Collège Notre Dame du Congo"
                value={previousSchool}
                onChange={e => setPreviousSchool(e.target.value)}
              />

              <div className="flex justify-end pt-4">
                <Button variant="primary" type="button" onClick={() => setStep(2)} icon="arrow_forward" iconPosition="right">
                  Étape Suivante
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-primary border-b pb-2">2. Coordonnées des Responsables Légaux</h3>

              <Input
                label="Nom Complet du Responsable (Père / Mère / Tuteur) *"
                placeholder="ex: M. Christian Ilunga Mukendi"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Téléphone WhatsApp / Appel (RDC) *"
                  placeholder="+243 81 234 5678"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  required
                />
                <Input
                  label="Adresse Email"
                  type="email"
                  placeholder="parent.ilunga@gmail.com"
                  value={parentEmail}
                  onChange={e => setParentEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" type="button" onClick={() => setStep(1)} icon="arrow_back">
                  Précédent
                </Button>
                <Button variant="primary" type="button" onClick={() => setStep(3)} icon="arrow_forward" iconPosition="right">
                  Étape Suivante
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-primary border-b pb-2">3. Pièces Justificatives & Confirmation</h3>

              <Alert type="info" title="Documents Requis par l’Établissement">
                Veuillez préparer les originaux pour la rentrée scolaire. Vous pouvez joindre des photos lisibles ci-dessous :
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 border-2 border-dashed border-outline-variant rounded-lg text-center bg-surface-container-low/40">
                  <span className="material-symbols-outlined text-3xl text-primary mb-1">upload_file</span>
                  <p className="font-bold text-xs">Acte de Naissance (PDF / Photo)</p>
                  <span className="text-[10px] text-success font-bold block mt-1">✓ Fichier prêt à être téléversé</span>
                </div>
                <div className="p-4 border-2 border-dashed border-outline-variant rounded-lg text-center bg-surface-container-low/40">
                  <span className="material-symbols-outlined text-3xl text-primary mb-1">upload_file</span>
                  <p className="font-bold text-xs">Bulletins Scolaires Récents</p>
                  <span className="text-[10px] text-success font-bold block mt-1">✓ Fichier prêt à être téléversé</span>
                </div>
              </div>

              {/* Summary box */}
              <div className="p-4 bg-surface-container-low rounded-lg space-y-1 text-xs">
                <p><strong>Élève :</strong> {lastName} {firstName} ({gender})</p>
                <p><strong>Établissement :</strong> {selectedSchool.name}</p>
                <p><strong>Classe :</strong> {targetClass}</p>
                <p><strong>Responsable :</strong> {parentName} ({parentPhone})</p>
                <p><strong>Frais d'Étude de Dossier :</strong> <span className="font-bold text-primary">$25.00 USD</span> (payable à l'étape suivante)</p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" type="button" onClick={() => setStep(2)} icon="arrow_back">
                  Précédent
                </Button>
                <Button variant="accent" size="lg" type="submit" isLoading={isSubmitting} icon="check_circle">
                  Soumettre la Candidature & Procéder au Paiement
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};
