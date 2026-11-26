import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationService, studentService, invitationService, schoolService } from '../../services/api';
import { ApplicationDossier, Student } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export interface ApplicationReviewPageProps {}

export const ApplicationReviewPage: React.FC<ApplicationReviewPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { setRole, currentUser } = useAuth();

  const [application, setApplication] = useState<ApplicationDossier | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrolledStudent, setEnrolledStudent] = useState<Student | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [parentInviteInfo, setParentInviteInfo] = useState<{ action: string, message: string, code?: string } | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await applicationService.getApplicationById(id || 'app-01');
      if (data) {
        setApplication(data);
        setNotes(data.reviewNotes || '');
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  // Année scolaire en cours : celle de l'école, sinon déduite de la date (rentrée en septembre)
  const resolveAcademicYear = async (): Promise<string> => {
    try {
      const school = await schoolService.getMySchool();
      if (school?.currentAcademicYear) return school.currentAcademicYear;
    } catch (err) {
      console.error('Année scolaire de l\u2019école indisponible :', err);
    }
    const now = new Date();
    const start = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return `${start}-${start + 1}`;
  };

  // Le secrétariat confirme que le versement des frais de dossier a bien été reçu
  const handleConfirmFee = async () => {
    if (!application) return;
    setIsProcessing(true);
    try {
      await applicationService.markRegistrationFeePaid(application.id);
      setApplication({ ...application, registrationFeePaid: true });
      notify('success', 'Encaissement confirmé', 'Les frais de dossier sont marqués comme payés.');
    } catch (err) {
      console.error(err);
      notify('error', 'Erreur', 'Impossible de confirmer l\u2019encaissement.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Les pièces sont stockées par chemin : on génère un lien temporaire (5 minutes) à la consultation
  const openDocument = async (url?: string) => {
    if (!url) return;
    const prefix = 'storage://application-documents/';
    if (url.startsWith(prefix) && supabase) {
      const { data, error } = await supabase.storage
        .from('application-documents')
        .createSignedUrl(url.slice(prefix.length), 300);
      if (error || !data) {
        notify('error', 'Document indisponible', 'Impossible de générer le lien de consultation.');
        return;
      }
      window.open(data.signedUrl, '_blank', 'noopener');
    } else if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener');
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    setIsProcessing(true);
    try {
      await applicationService.updateApplicationStatus(application.id, 'APPROUVE', notes);
      const academicYear = await resolveAcademicYear();
      
      // Also automatically enroll student in the school registry!
      const newStudent = await studentService.addStudent({
        firstName: application.applicantFirstName,
        lastName: application.applicantLastName,
        gender: application.gender,
        birthDate: application.birthDate,
        birthPlace: 'Kinshasa',
        nationality: 'Congolaise',
        className: application.targetClass,
        section: application.targetSection,
        academicYear,
        enrollmentDate: new Date().toISOString().split('T')[0],
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        status: 'Inscrit',
        parentId: '', // le lien parent-élève est créé par l'invitation ci-dessous
        parentName: application.parentName,
        parentPhone: application.parentPhone,
        parentEmail: application.parentEmail,
        address: 'Kinshasa, RDC',
        tuitionStatus: 'Tranche 1',
        overallAverage: 0,
        rankInClass: 0,
        totalInClass: 40
      });

      // Generate Parent Invite
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const inviteResponse = await invitationService.inviteOrLinkParent(
        newStudent.id,
        application.parentName,
        application.parentPhone,
        application.parentEmail,
        code
      );
      
      if (inviteResponse.action === 'invited' && application.parentEmail && supabase) {
        try {
          await supabase.functions.invoke('send-invitation-email', {
            body: {
              email: application.parentEmail,
              name: application.parentName,
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
      setEnrolledStudent(newStudent);
      setShowSuccessModal(true);
      notify(
        'success',
        'Candidature Approuvée !',
        `L'élève ${application.applicantLastName} ${application.applicantFirstName} a été admis. L'invitation parentale SMS/WhatsApp a été envoyée.`
      );
    } catch {
      notify('error', 'Erreur', 'Impossible de valider la candidature.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    setIsProcessing(true);
    try {
      await applicationService.updateApplicationStatus(application.id, 'REJETE', notes);
      notify('warning', 'Candidature Rejetée', 'Le statut a été mis à jour.');
      navigate('/direction/applications');
    } catch {
      notify('error', 'Erreur', 'Impossible de mettre à jour le statut.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Chargement du dossier..." />;
  if (!application) return <div className="p-8 text-center text-error">Dossier introuvable.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/direction/applications" className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Retour à la liste des candidatures</span>
        </Link>
        <Badge
          variant={
            application.status === 'APPROUVE' ? 'success' :
            application.status === 'EN_EXAMEN' ? 'warning' :
            application.status === 'REJETE' ? 'error' : 'info'
          }
          size="md"
        >
          Statut Actuel : {application.status}
        </Badge>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-4">
          <div>
            <h1 className="text-2xl font-black text-primary">
              {application.applicantLastName} {application.applicantFirstName}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Dossier #{application.id} • Déposé le {application.submissionDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">Frais de dossier :</span>
            <Badge variant={application.registrationFeePaid ? 'success' : 'warning'} size="sm">
              {application.registrationFeePaid ? 'Encaissé ($25.00)' : 'Non Encaissé'}
            </Badge>
            {!application.registrationFeePaid && (application as any).paymentReference && (
              <span className="text-[11px] text-on-surface-variant">
                Paiement déclaré · réf. <strong className="font-mono">{(application as any).paymentReference}</strong>
              </span>
            )}
            {!application.registrationFeePaid && (
              <Button variant="outline" size="sm" icon="payments" onClick={handleConfirmFee} disabled={isProcessing}>
                Confirmer l'encaissement
              </Button>
            )}
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Classe & Section</span>
            <p className="font-bold text-primary text-sm">{application.targetClass}</p>
            <p className="text-on-surface-variant">{application.targetSection}</p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Identité Candidat</span>
            <p className="font-semibold text-on-surface">Genre : {application.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
            <p className="text-on-surface">Né(e) le : {application.birthDate}</p>
            <p className="text-on-surface-variant">École préc. : {application.previousSchool}</p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Parent / Tuteur</span>
            <p className="font-bold text-on-surface">{application.parentName}</p>
            <p className="font-mono text-primary">{application.parentPhone}</p>
            <p className="text-on-surface-variant">{application.parentEmail}</p>
          </div>
        </div>
      </div>

      {/* Required Attachments Checklist */}
      <Card title="Pièces Justificatives Transmises" subtitle="Vérification de conformité des documents">
        <div className="space-y-3 text-xs">
          {application.documents.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/60">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">description</span>
                <div>
                  <h5 className="font-bold text-on-surface">{doc.name}</h5>
                  <span className="text-[10px] text-on-surface-variant">Document officiel scanné</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.url && (
                  <Button variant="outline" size="sm" icon="visibility" onClick={() => openDocument(doc.url)}>
                    Consulter
                  </Button>
                )}
                <Badge variant={doc.status === 'VALIDE' ? 'success' : 'warning'} size="sm">
                  {doc.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Review Notes & Deliberation */}
      <Card title="Avis & Décision de la Direction" subtitle="Observations pédagogiques et attribution de matricule">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
              Notes du Conseil de Direction :
            </label>
            <textarea
              className="w-full h-24 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Saisissez les remarques ou conditions d'admission (ex: Bon dossier académique, admis en 4ème Sc. A)..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
            <Button
              variant="danger"
              size="md"
              icon="cancel"
              onClick={handleReject}
              isLoading={isProcessing}
            >
              Rejeter la Candidature
            </Button>
            <Button
              variant="accent"
              size="lg"
              icon="how_to_reg"
              onClick={handleApprove}
              isLoading={isProcessing}
              className="font-extrabold shadow-md"
            >
              Approuver & Inscrire Définitivement au Registre
            </Button>
          </div>
        </div>
      </Card>

      {/* Success Modal with Invitation and Quick Links */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Admission Confirmée & Invitation Parent Transmise"
        subtitle="L'élève est maintenant enregistré et le parent a reçu son accès"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-success/10 border border-success/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-success font-black text-sm">
              <span className="material-symbols-outlined text-xl">check_circle</span>
              <span>Inscription Réussie dans le Registre Matricule !</span>
            </div>
            <p className="text-on-surface">
              <strong>Élève :</strong> {application.applicantLastName} {application.applicantFirstName} ({application.targetClass})
            </p>
            <p className="text-on-surface">
              <strong>Matricule Officiel Attribué :</strong> <span className="font-mono font-bold text-primary">{enrolledStudent?.matricule}</span>
            </p>
          </div>

          {/* SMS Simulation */}
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
                  "Félicitations {application?.parentName} ! Votre enfant {application?.applicantFirstName} est admis au Collège. Matricule : {enrolledStudent?.matricule}. 
                  Voici votre code d'activation pour accéder à l'espace parent : {parentInviteInfo?.code}. Rendez-vous sur {window.location.origin}/activer"
                </p>
                <div className="flex gap-2 items-stretch mt-2">
                  <div className="text-center p-2 bg-white rounded border-2 border-dashed border-primary flex-1">
                    <span className="text-xs uppercase font-bold text-on-surface-variant block">Code d'activation Parent</span>
                    <span className="text-xl font-black text-primary tracking-widest">{parentInviteInfo?.code}</span>
                  </div>
                  {application?.parentPhone && (
                    <Button
                      variant="primary"
                      className="bg-[#25D366] hover:bg-[#1DA851] text-white border-none"
                      onClick={() => {
                        const cleanPhone = application.parentPhone.replace(/\s+/g, '');
                        const link = `${window.location.origin}/activer?code=${parentInviteInfo?.code}`;
                        const text = encodeURIComponent(`Bonjour ${application.parentName},\n\nVotre enfant ${application.applicantFirstName} est admis ! Matricule: ${enrolledStudent?.matricule}.\n\nVoici votre code d'activation pour l'espace parent :\n*${parentInviteInfo?.code}*\n\nRendez-vous sur ${link} pour créer votre compte.`);
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
              variant="accent"
              fullWidth
              size="md"
              icon="family_restroom"
              onClick={() => {
                setRole('parent');
                navigate('/parent');
              }}
            >
              Tester l'Espace Parent de cet Élève
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                fullWidth
                size="sm"
                icon="folder_shared"
                onClick={() => navigate('/secretariat/students')}
              >
                Voir au Registre
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="sm"
                icon="arrow_back"
                onClick={() => navigate('/direction/applications')}
              >
                Retour aux Dossiers
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
