import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService, invitationService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export interface StudentEnrollmentPageProps {}

export const StudentEnrollmentPage: React.FC<StudentEnrollmentPageProps> = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { currentUser } = useAuth();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [birthDate, setBirthDate] = useState('2010-04-12');
  const [birthPlace, setBirthPlace] = useState('Kinshasa');
  const [className, setClassName] = useState('4ème Scientifique A');
  const [section, setSection] = useState('Scientifique (Biologie-Chimie)');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+243 ');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('Commune de la Gombe, Kinshasa');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [enrolledStudent, setEnrolledStudent] = useState<any>(null);
  const [parentInviteInfo, setParentInviteInfo] = useState<{ action: string, message: string, code?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName || !firstName || !parentName || !parentPhone) {
      notify('error', 'Champs obligatoires', 'Veuillez renseigner toutes les informations requises.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await studentService.addStudent({
        firstName,
        lastName,
        middleName,
        gender,
        birthDate,
        birthPlace,
        nationality: 'Congolaise',
        className,
        section,
        academicYear: '2025 - 2026',
        enrollmentDate: new Date().toISOString().split('T')[0],
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        status: 'Inscrit',
        parentId: `parent-${Date.now()}`,
        parentName,
        parentPhone,
        parentEmail: parentEmail || 'contact@elimu.cd',
        address,
        medicalNotes,
        tuitionStatus: 'Tranche 1',
        overallAverage: 0,
        rankInClass: 0,
        totalInClass: 38
      });

      // Generate Parent Invite
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const inviteResponse = await invitationService.inviteOrLinkParent(
        created.id,
        parentName,
        parentPhone,
        parentEmail || 'contact@elimu.cd',
        code
      );
      
      if (inviteResponse.action === 'invited' && parentEmail && supabase) {
        try {
          await supabase.functions.invoke('send-invitation-email', {
            body: {
              email: parentEmail,
              name: parentName,
              role: 'parent',
              schoolName: currentUser?.schoolName || 'votre école',
              code: inviteResponse.code,
              appUrl: window.location.origin
            }
          });
        } catch (err) {
          console.error('Email parent non envoyé:', err);
        }
      }
      
      setParentInviteInfo(inviteResponse);
      setEnrolledStudent(created);
      setShowSuccessModal(true);
      notify('success', 'Élève Inscrit avec Succès !', `Matricule officiel généré : ${created.matricule}`);
    } catch {
      notify('error', 'Erreur', 'Impossible d’enregistrer l’élève.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Fiche d’Inscription & Attribution de Matricule
        </h1>
        <p className="text-xs text-on-surface-variant">
          Formulaire officiel du Secrétariat Scolaire • Conforme au registre matricule national
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identité de l'élève */}
        <Card title="1. État Civil & Identité de l'Élève">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Nom de famille *"
                placeholder="ex: ILUNGA"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
              <Input
                label="Post-nom *"
                placeholder="ex: MUKENDI"
                value={middleName}
                onChange={e => setMiddleName(e.target.value)}
              />
              <Input
                label="Prénom *"
                placeholder="ex: Glody"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Sexe / Genre *"
                options={[{ value: 'M', label: 'Masculin (M)' }, { value: 'F', label: 'Féminin (F)' }]}
                value={gender}
                onChange={e => setGender(e.target.value as any)}
              />
              <Input
                label="Date de Naissance *"
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                required
              />
              <Input
                label="Lieu de Naissance *"
                placeholder="ex: Kinshasa"
                value={birthPlace}
                onChange={e => setBirthPlace(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Classe Affectée *"
                options={[
                  '4ème Scientifique A',
                  '4ème Scientifique B',
                  '4ème Littéraire A',
                  '4ème Commerciale & Gestion',
                  '1ère Humanités A',
                  '1ère Humanités B'
                ]}
                value={className}
                onChange={e => setClassName(e.target.value)}
              />
              <Select
                label="Section / Option *"
                options={[
                  'Scientifique (Biologie-Chimie)',
                  'Scientifique (Math-Physique)',
                  'Littéraire (Latin-Philo)',
                  'Commerciale & Gestion',
                  'Éducation de Base'
                ]}
                value={section}
                onChange={e => setSection(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Responsables Légaux */}
        <Card title="2. Responsables Légaux & Contact">
          <div className="space-y-4">
            <Input
              label="Nom Complet du Responsable Principal (Père/Mère/Tuteur) *"
              placeholder="ex: M. Christian Ilunga Mukendi"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Téléphone Portable (RDC) *"
                placeholder="+243 85 123 4567"
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                required
              />
              <Input
                label="Email du Parent"
                type="email"
                placeholder="parent@gmail.com"
                value={parentEmail}
                onChange={e => setParentEmail(e.target.value)}
              />
            </div>

            <Input
              label="Adresse Résidentielle Complète"
              placeholder="N° Avenue, Quartier, Commune"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />

            <Input
              label="Observations Médicales & Particularités"
              placeholder="Allergies, port de lunettes, asthme..."
              value={medicalNotes}
              onChange={e => setMedicalNotes(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/secretariat/students')}>
            Annuler
          </Button>
          <Button variant="accent" size="lg" type="submit" isLoading={isSubmitting} icon="badge">
            Valider l'Inscription & Générer le Matricule
          </Button>
        </div>
      </form>

      {/* Success Modal with Invitation and Quick Links */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/secretariat/students');
        }}
        title="Inscription Confirmée & Invitation Parent Transmise"
        subtitle="L'élève est maintenant enregistré et le parent a reçu son accès"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-success/10 border border-success/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-success font-black text-sm">
              <span className="material-symbols-outlined text-xl">check_circle</span>
              <span>Inscription Réussie dans le Registre Matricule !</span>
            </div>
            <p className="text-on-surface">
              <strong>Élève :</strong> {enrolledStudent?.lastName} {enrolledStudent?.firstName} ({enrolledStudent?.className})
            </p>
            <p className="text-on-surface">
              <strong>Matricule Officiel Attribué :</strong> <span className="font-mono font-bold text-primary">{enrolledStudent?.matricule}</span>
            </p>
          </div>

          <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-primary">
              <span>📱 Action requise pour le parent :</span>
              <Badge variant="success" size="sm">{parentInviteInfo?.action === 'linked' ? 'Compte mis à jour' : 'Invitation envoyée'}</Badge>
            </div>
            
            {parentInviteInfo?.action === 'linked' ? (
              <p className="text-sm text-on-surface p-2">
                {parentInviteInfo.message}
              </p>
            ) : (
              <>
                <p className="font-mono text-[11px] text-on-surface-variant bg-white p-2.5 rounded border">
                  "Félicitations {parentName} ! Votre enfant {firstName} est admis au Collège. Matricule : {enrolledStudent?.matricule}. 
                  Voici votre code d'activation pour accéder à l'espace parent : {parentInviteInfo?.code}. Rendez-vous sur {window.location.origin}/activer"
                </p>
                <div className="flex gap-2 items-stretch mt-2">
                  <div className="text-center p-2 bg-white rounded border-2 border-dashed border-primary flex-1">
                    <span className="text-xs uppercase font-bold text-on-surface-variant block">Code d'activation Parent</span>
                    <span className="text-xl font-black text-primary tracking-widest">{parentInviteInfo?.code}</span>
                  </div>
                  {parentPhone && (
                    <Button
                      variant="primary"
                      className="bg-[#25D366] hover:bg-[#1DA851] text-white border-none"
                      onClick={() => {
                        const cleanPhone = parentPhone.replace(/\s+/g, '');
                        const link = `${window.location.origin}/activer?code=${parentInviteInfo?.code}`;
                        const text = encodeURIComponent(`Bonjour ${parentName},\n\nVotre enfant ${firstName} est admis ! Matricule: ${enrolledStudent?.matricule}.\n\nVoici votre code d'activation pour l'espace parent :\n*${parentInviteInfo?.code}*\n\nRendez-vous sur ${link} pour créer votre compte.`);
                        window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
                      }}
                    >
                      <span className="material-symbols-outlined mr-1">send</span>
                      WhatsApp
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-outline-variant space-y-2">
            <Button
              variant="primary"
              fullWidth
              size="md"
              icon="folder_shared"
              onClick={() => navigate('/secretariat/students')}
            >
              Retour au Registre
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
