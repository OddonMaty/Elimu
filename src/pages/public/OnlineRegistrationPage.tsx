import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { School, ClassSection } from '../../types';
import { schoolService, applicationService, classService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { supabase } from '../../lib/supabaseClient';

interface FileUploadZoneProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  description?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  label,
  file,
  onFileSelect,
  accept = 'application/pdf,image/*',
  description = 'Format PDF, JPG, PNG ou WebP (max 8 Mo)'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} Ko`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 select-none ${
        isDragging
          ? 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.01]'
          : file
          ? 'border-success/60 bg-success/5 hover:bg-success/10'
          : 'border-outline-variant bg-surface-container-low/40 hover:border-primary/50 hover:bg-surface-container-low'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      {file ? (
        <div className="space-y-1.5 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <p className="font-bold text-xs text-on-surface">{label}</p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-success font-semibold max-w-full px-2">
            <span className="text-success font-bold text-sm">✓</span>
            <span className="truncate max-w-[180px] sm:max-w-[220px]" title={file.name}>
              {file.name}
            </span>
            <span className="text-[10px] text-on-surface-variant font-normal">
              ({formatSize(file.size)})
            </span>
          </div>
          <span className="text-[11px] text-primary hover:underline block pt-0.5">
            Cliquer pour remplacer
          </span>
        </div>
      ) : (
        <div className="space-y-1.5 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">upload_file</span>
          </div>
          <p className="font-bold text-xs text-on-surface">{label}</p>
          <p className="text-xs text-on-surface-variant font-medium">Cliquez ou glissez un fichier ici</p>
          <span className="text-[10px] text-outline block">{description}</span>
        </div>
      )}
    </div>
  );
};

export interface OnlineRegistrationPageProps {}

const MAX_FILE_BYTES = 8 * 1024 * 1024;

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
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('Scientifique (Bio-Chimie)');
  const [previousSchool, setPreviousSchool] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+243 ');
  const [parentEmail, setParentEmail] = useState('');
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [reportCardFile, setReportCardFile] = useState<File | null>(null);
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

  useEffect(() => {
    if (!selectedSchool?.id) return;
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const clsList = await classService.getClasses(selectedSchool.id);
        setClasses(clsList);
        if (clsList.length > 0) {
          if (!clsList.some(c => c.name === targetClass)) {
            setTargetClass(clsList[0].name);
          }
        } else {
          setTargetClass('');
        }
      } catch (err) {
        console.error('Erreur chargement des classes de l\'école:', err);
        setClasses([]);
        setTargetClass('');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [selectedSchool?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !parentName || !parentPhone) {
      notify('error', 'Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!birthCertFile || !reportCardFile) {
      notify('error', 'Documents requis', 'Veuillez sélectionner l\'acte de naissance et les bulletins scolaires récents.');
      return;
    }

    setIsSubmitting(true);
    try {
      let birthCertUrl = '';
      let reportCardUrl = '';
      // Identifiant du dossier : sert de dossier de stockage et de jeton de suivi pour le candidat
      const applicationId = crypto.randomUUID();

      // Contrôles côté navigateur (les mêmes limites sont imposées par le stockage)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      for (const f of [birthCertFile, reportCardFile]) {
        if (!allowedTypes.includes(f.type)) {
          throw new Error(`Format non accepté pour « ${f.name} ». Utilisez un PDF ou une image JPG, PNG ou WebP.`);
        }
        if (f.size > MAX_FILE_BYTES) {
          throw new Error(`« ${f.name} » dépasse 8 Mo. Réduisez la taille du fichier.`);
        }
      }

      if (supabase) {
        const client = supabase;
        const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const upload = async (label: string, file: File, prefix: string) => {
          const path = `${applicationId}/${prefix}_${sanitize(file.name)}`;
          const { error } = await client.storage
            .from('application-documents')
            .upload(path, file, { cacheControl: '3600', upsert: false });
          if (error) {
            throw new Error(`Erreur lors du téléversement (${label}) : ${error.message}`);
          }
          // On enregistre le chemin, pas un lien public : le personnel de l'école génère un lien temporaire à la consultation
          return `storage://application-documents/${path}`;
        };
        birthCertUrl = await upload('acte de naissance', birthCertFile, 'acte_naissance');
        reportCardUrl = await upload('bulletin scolaire', reportCardFile, 'bulletin');
      } else {
        // Fallback pour le mode démo hors-ligne
        birthCertUrl = `mock://storage/application-documents/${Date.now()}_${birthCertFile.name}`;
        reportCardUrl = `mock://storage/application-documents/${Date.now()}_${reportCardFile.name}`;
      }

      const app = await applicationService.submitApplication({
        id: applicationId,
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
          { name: 'Acte de Naissance', url: birthCertUrl, status: 'EN_ATTENTE' },
          { name: 'Bulletin Scolaire', url: reportCardUrl, status: 'EN_ATTENTE' }
        ]
      });

      notify('success', 'Dossier Enregistré !', `Votre candidature #${app.id} a été transmise à la direction.`);
      navigate(`/register/payment?appId=${app.id}`);
    } catch (err: any) {
      notify('error', 'Erreur', err?.message || 'Impossible de soumettre la candidature.');
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
                {loadingClasses ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Classe Demandée *</label>
                    <div className="p-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      <span>Chargement des classes...</span>
                    </div>
                  </div>
                ) : classes.length > 0 ? (
                  <Select
                    label="Classe Demandée *"
                    options={classes.map(c => c.name)}
                    value={targetClass}
                    onChange={e => setTargetClass(e.target.value)}
                    required
                  />
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Classe Demandée *</label>
                    <div className="p-2.5 bg-error/10 border border-error/30 rounded-lg flex items-center gap-1.5 text-error text-xs font-medium">
                      <span className="material-symbols-outlined text-sm flex-shrink-0">warning</span>
                      <span>Cette école n'a pas encore configuré ses classes</span>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="École de Provenance"
                placeholder="ex: Collège Notre Dame du Congo"
                value={previousSchool}
                onChange={e => setPreviousSchool(e.target.value)}
              />

              <div className="flex flex-col items-end pt-4 gap-2">
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={classes.length === 0 || loadingClasses || !targetClass}
                  icon="arrow_forward"
                  iconPosition="right"
                >
                  Étape Suivante
                </Button>
                {classes.length === 0 && !loadingClasses && (
                  <p className="text-[11px] text-error font-medium">
                    Impossible de poursuivre : aucune classe disponible pour cet établissement.
                  </p>
                )}
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
                <FileUploadZone
                  label="Acte de Naissance (PDF / Photo)"
                  file={birthCertFile}
                  onFileSelect={setBirthCertFile}
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                />
                <FileUploadZone
                  label="Bulletins Scolaires Récents"
                  file={reportCardFile}
                  onFileSelect={setReportCardFile}
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                />
              </div>

              {/* Summary box */}
              <div className="p-4 bg-surface-container-low rounded-lg space-y-1 text-xs">
                <p><strong>Élève :</strong> {lastName} {firstName} ({gender})</p>
                <p><strong>Établissement :</strong> {selectedSchool.name}</p>
                <p><strong>Classe :</strong> {targetClass}</p>
                <p><strong>Responsable :</strong> {parentName} ({parentPhone})</p>
                <p><strong>Frais d'Étude de Dossier :</strong> <span className="font-bold text-primary">$25.00 USD</span> (payable à l'étape suivante)</p>
              </div>

              {(!birthCertFile || !reportCardFile) && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium justify-end">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>Veuillez téléverser les 2 documents obligatoires pour valider votre dossier.</span>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" type="button" onClick={() => setStep(2)} icon="arrow_back">
                  Précédent
                </Button>
                <Button
                  variant="accent"
                  size="lg"
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={!birthCertFile || !reportCardFile || isSubmitting}
                  icon="check_circle"
                >
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
