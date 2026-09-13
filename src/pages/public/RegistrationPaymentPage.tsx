import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { applicationService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';

export interface RegistrationPaymentPageProps {}

export const RegistrationPaymentPage: React.FC<RegistrationPaymentPageProps> = () => {
  const [searchParams] = useSearchParams();
  const appId = searchParams.get('appId') || 'app-01';
  const { notify } = useNotification();

  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'orange' | 'airtel' | 'visa'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('+243 81 555 1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        await applicationService.markRegistrationFeePaid(appId);
      } catch (err) {
        console.error('Erreur lors de la mise à jour du paiement :', err);
      }
      setIsProcessing(false);
      setIsPaid(true);
      notify('success', 'Paiement Validé avec Succès !', 'Le reçu officiel a été généré et votre dossier est en cours d\u2019examen.');
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6 pb-20 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="warning" size="sm" icon="lock">
          Guichet de Paiement Sécurisé RDC
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
          Paiement des Frais de Dossier d'Inscription
        </h1>
        <p className="text-xs text-on-surface-variant">
          Dossier de candidature : <span className="font-mono font-bold text-primary">#{appId}</span>
        </p>
      </div>

      {isPaid ? (
        <Card noPadding className="text-center p-8 space-y-5 bg-surface-container-lowest border-success">
          <div className="w-16 h-16 bg-success-container text-success rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-primary">Paiement Confirmé !</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Votre versement de <strong>$25.00 USD (71 250 FC)</strong> a été reçu par la caisse centrale de l'établissement.
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-lg text-left text-xs space-y-1 font-mono">
            <p><strong>Référence :</strong> MP-{Date.now().toString().slice(-8)}</p>
            <p><strong>Dossier :</strong> #{appId}</p>
            <p><strong>Statut :</strong> EN COURS D'EXAMEN PAR LA DIRECTION</p>
            <p><strong>Notification :</strong> SMS de confirmation envoyé</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/schools" className="flex-1">
              <Button variant="outline" size="md" fullWidth icon="school">
                Retour à l'Annuaire
              </Button>
            </Link>
            <Link to="/direction/applications" className="flex-1">
              <Button variant="primary" size="md" fullWidth icon="dashboard">
                Voir l'Espace Direction
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handlePay} className="space-y-6">
            {/* Amount Banner */}
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant block font-semibold">Montant à régler :</span>
                <span className="text-2xl font-black text-primary">$25.00 USD</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-on-surface-variant block">Équivalent en Francs Congolais :</span>
                <span className="text-sm font-bold text-on-surface">71 250 CDF</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                Sélectionnez le mode de paiement Mobile Money :
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    MP
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">M-Pesa</h5>
                    <p className="text-[10px] text-on-surface-variant">Vodacom RDC</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange')}
                  className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'orange'
                      ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    OM
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Orange Money</h5>
                    <p className="text-[10px] text-on-surface-variant">Orange RDC</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('airtel')}
                  className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'airtel'
                      ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-red-700 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    AM
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Airtel Money</h5>
                    <p className="text-[10px] text-on-surface-variant">Airtel RDC</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('visa')}
                  className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'visa'
                      ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    CB
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Carte Bancaire</h5>
                    <p className="text-[10px] text-on-surface-variant">Visa / Mastercard</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Phone input for mobile money push */}
            {paymentMethod !== 'visa' ? (
              <div className="space-y-1">
                <Input
                  label={`Numéro de téléphone ${paymentMethod.toUpperCase()} (pour validation USSD)`}
                  placeholder="+243 81 234 5678"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  icon="smartphone"
                  required
                />
                <p className="text-[11px] text-on-surface-variant">
                  Vous recevrez une notification sur votre téléphone pour taper votre code PIN secret.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Input label="Numéro de Carte Bancaire" placeholder="4000 1234 5678 9010" icon="credit_card" required />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Date d'expiration" placeholder="MM/AA" required />
                  <Input label="Code CVC / CVV" placeholder="123" required />
                </div>
              </div>
            )}

            <Button
              variant="accent"
              size="lg"
              fullWidth
              type="submit"
              isLoading={isProcessing}
              icon="lock"
              className="font-extrabold shadow-md"
            >
              Payer $25.00 USD en toute sécurité
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
