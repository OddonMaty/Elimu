import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { applicationService, schoolService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';
import type { School } from '../../types';

export interface RegistrationPaymentPageProps {}

// Frais d'étude de dossier : montant indicatif en attendant un réglage par école
const REGISTRATION_FEE_USD = 25;

type OperatorId = 'mpesa' | 'orange' | 'airtel';
const OPERATORS: { id: OperatorId; label: string; network: string; color: string; short: string }[] = [
  { id: 'mpesa', label: 'M-Pesa', network: 'Vodacom RDC', color: 'bg-red-600', short: 'MP' },
  { id: 'orange', label: 'Orange Money', network: 'Orange RDC', color: 'bg-orange-500', short: 'OM' },
  { id: 'airtel', label: 'Airtel Money', network: 'Airtel RDC', color: 'bg-red-500', short: 'AM' }
];

type Status = Awaited<ReturnType<typeof applicationService.getPublicStatus>>;

export const RegistrationPaymentPage: React.FC<RegistrationPaymentPageProps> = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId');
  const { notify } = useNotification();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>(null);
  const [school, setSchool] = useState<School | undefined>(undefined);
  const [operator, setOperator] = useState<OperatorId>('mpesa');
  const [reference, setReference] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!appId) {
        setLoading(false);
        return;
      }
      try {
        const st = await applicationService.getPublicStatus(appId);
        if (cancelled) return;
        setStatus(st);
        if (st?.schoolId) {
          const sc = await schoolService.getSchoolById(st.schoolId);
          if (!cancelled) setSchool(sc);
        }
      } catch (err) {
        console.error('Impossible de charger le dossier :', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appId]);

  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId) return;
    if (reference.trim().length < 4) {
      notify('error', 'Référence manquante', 'Saisissez la référence de la transaction reçue par SMS après votre paiement.');
      return;
    }
    setIsSending(true);
    try {
      await applicationService.declarePayment(appId, reference.trim());
      const st = await applicationService.getPublicStatus(appId);
      setStatus(st);
      notify('success', 'Paiement déclaré', 'Le secrétariat de l’école vérifiera votre versement et confirmera votre dossier.');
    } catch (err: any) {
      notify('error', 'Déclaration impossible', err?.message || 'Veuillez réessayer dans un instant.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!appId || !status) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 space-y-4">
        <Alert type="error" title="Dossier introuvable">
          Le lien de paiement est incomplet ou le dossier n’existe plus. Reprenez votre candidature depuis le début.
        </Alert>
        <Link to="/schools">
          <Button variant="outline" fullWidth icon="school">Retour aux écoles</Button>
        </Link>
      </div>
    );
  }

  const confirmed = !!status.registrationFeePaid;
  const declared = !confirmed && !!status.paymentDeclaredAt;
  const payNumber = school?.paymentPhone;

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6 pb-20 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant={confirmed ? 'success' : 'warning'} size="sm" icon={confirmed ? 'verified' : 'payments'}>
          {confirmed ? 'Frais de dossier confirmés' : 'Frais de dossier d’inscription'}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
          Paiement des frais de dossier
        </h1>
        <p className="text-xs text-on-surface-variant">
          Candidature de <strong>{status.applicantFirstName} {status.applicantLastName}</strong> à{' '}
          <strong>{status.schoolName}</strong>
        </p>
        <p className="text-[11px] text-on-surface-variant">
          Numéro de dossier : <span className="font-mono font-bold text-primary break-all">{appId}</span>
          <br />
          Conservez ce numéro : il vous permet de suivre votre dossier.
        </p>
      </div>

      {confirmed && (
        <Card noPadding className="text-center p-8 space-y-4 bg-surface-container-lowest border-success">
          <div className="w-16 h-16 bg-success-container text-success rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h3 className="text-xl font-black text-primary">Paiement confirmé par l’école</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Votre dossier est en cours d’examen par la direction. L’école vous contactera au numéro indiqué dans votre candidature.
          </p>
          <Link to="/schools">
            <Button variant="outline" size="md" fullWidth icon="school">Retour aux écoles</Button>
          </Link>
        </Card>
      )}

      {declared && (
        <Card noPadding className="p-8 space-y-4 bg-surface-container-lowest">
          <div className="w-16 h-16 bg-primary-fixed/40 text-primary rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">hourglass_top</span>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-primary">Paiement déclaré, en attente de confirmation</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Référence enregistrée : <strong className="font-mono">{status.paymentReference}</strong>.
              Le secrétariat vérifie la réception du versement avant de valider votre dossier. Aucune action
              supplémentaire n’est nécessaire.
            </p>
          </div>
          <Link to="/schools">
            <Button variant="outline" size="md" fullWidth icon="school">Retour aux écoles</Button>
          </Link>
        </Card>
      )}

      {!confirmed && !declared && (
        <Card>
          <form onSubmit={handleDeclare} className="space-y-6">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant block font-semibold">Montant à régler :</span>
                <span className="text-2xl font-black text-primary">${REGISTRATION_FEE_USD}.00 USD</span>
              </div>
              <div className="text-right text-[11px] text-on-surface-variant">
                Le montant exact en francs congolais<br />dépend du taux appliqué par l’école.
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                1. Choisissez votre opérateur Mobile Money
              </label>
              <div className="grid grid-cols-3 gap-3">
                {OPERATORS.map(op => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperator(op.id)}
                    className={`p-3 rounded-lg border text-left flex flex-col items-start gap-2 transition-all ${
                      operator === op.id
                        ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${op.color} text-white font-black text-[10px] flex items-center justify-center`}>
                      {op.short}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs">{op.label}</h5>
                      <p className="text-[10px] text-on-surface-variant">{op.network}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                2. Envoyez le montant au numéro de l’école
              </label>
              {payNumber ? (
                <div className="p-4 rounded-lg border border-outline-variant bg-surface-container-low text-center">
                  <p className="text-[11px] text-on-surface-variant">
                    {OPERATORS.find(o => o.id === operator)?.label} · {school?.name}
                  </p>
                  <p className="text-2xl font-black tracking-wider text-primary">{payNumber}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Indiquez le nom du candidat en motif si l’application le permet.
                  </p>
                </div>
              ) : (
                <Alert type="warning" title="Numéro de paiement non renseigné">
                  Cette école n’a pas encore publié de numéro Mobile Money. Contactez-la
                  {school?.phone ? <> au <strong>{school.phone}</strong></> : null} pour connaître le moyen de paiement.
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                3. Déclarez votre paiement
              </label>
              <Input
                label="Référence de la transaction (reçue par SMS)"
                placeholder="Ex. : MP241121.1234.A56789"
                icon="receipt_long"
                value={reference}
                onChange={e => setReference(e.target.value)}
                maxLength={100}
                required
              />
              <p className="text-[11px] text-on-surface-variant">
                Votre dossier n’est confirmé qu’après vérification du versement par le secrétariat de l’école.
                Ne communiquez jamais votre code secret.
              </p>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth icon="send" disabled={isSending || !payNumber}>
              {isSending ? 'Envoi en cours…' : 'J’ai effectué le paiement'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
