import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { financeService } from '../../services/api';
import { TuitionInvoice } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface ParentFinancesPageProps {}

export const ParentFinancesPage: React.FC<ParentFinancesPageProps> = () => {
  const [invoices, setInvoices] = useState<TuitionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<TuitionInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa RDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await financeService.getInvoices();
      setInvoices(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setIsProcessing(true);

    setTimeout(() => {
      setInvoices(prev => prev.map(i =>
        i.id === selectedInvoice.id
          ? { ...i, status: 'PAYE', paymentMethod: paymentMethod as any, paymentDate: new Date().toISOString().split('T')[0] }
          : i
      ));
      setSelectedInvoice(null);
      setIsProcessing(false);
      notify('success', 'Paiement Confirmé !', `Votre versement de $${selectedInvoice.amountUSD} USD via ${paymentMethod} a été validé. Le reçu a été envoyé par SMS.`);
    }, 1200);
  };

  const totalPaid = invoices.filter(i => i.status === 'PAYE').reduce((sum, i) => sum + i.amountUSD, 0);
  const totalPending = invoices.filter(i => i.status === 'EN_ATTENTE').reduce((sum, i) => sum + i.amountUSD, 0);

  if (loading) return <LoadingSpinner message="Chargement du dossier financier..." />;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Gestion des Frais Scolaires & Paiements
        </h1>
        <p className="text-xs text-on-surface-variant">
          Minerval, tranches scolaires et reçus officiels — Paiement Mobile Money disponible
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card noPadding className="p-4 border-l-4 border-l-success">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Total Réglé</span>
          <span className="text-2xl font-black text-success mt-1 block">${totalPaid} USD</span>
        </Card>
        <Card noPadding className={`p-4 border-l-4 ${totalPending > 0 ? 'border-l-warning' : 'border-l-success'}`}>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Solde Restant</span>
          <span className={`text-2xl font-black mt-1 block ${totalPending > 0 ? 'text-warning' : 'text-success'}`}>
            ${totalPending} USD
          </span>
        </Card>
      </div>

      {/* Invoices */}
      <div className="space-y-4">
        {invoices.map(inv => (
          <Card key={inv.id} noPadding className={`p-5 border-l-4 ${inv.status === 'PAYE' ? 'border-l-success' : 'border-l-warning'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-primary">{inv.tranche}</span>
                  <Badge variant={inv.status === 'PAYE' ? 'success' : 'warning'} size="sm" dot>
                    {inv.status === 'PAYE' ? 'Encaissé' : 'À Payer'}
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Facture #{inv.invoiceNumber} • Année scolaire {inv.academicYear}
                </p>
                {inv.status === 'PAYE' ? (
                  <p className="text-xs text-success font-semibold">
                    Payé le {inv.paymentDate} via {inv.paymentMethod}
                  </p>
                ) : (
                  <p className="text-xs text-warning font-semibold">
                    Échéance : {inv.dueDate}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xl font-black text-primary block">${inv.amountUSD} USD</span>
                  <span className="text-[10px] text-on-surface-variant">{inv.amountCDF.toLocaleString()} FC</span>
                </div>

                {inv.status === 'EN_ATTENTE' ? (
                  <Button variant="accent" size="sm" icon="payment" onClick={() => setSelectedInvoice(inv)}>
                    Payer via Mobile Money
                  </Button>
                ) : (
                  <Link to={`/parent/finances/receipt/${inv.id}`}>
                    <Button variant="outline" size="sm" icon="receipt">
                      Reçu
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Paiement des Frais Scolaires"
        subtitle={`${selectedInvoice?.tranche} — ${selectedInvoice?.studentName}`}
      >
        <form onSubmit={handlePay} className="space-y-4">
          <div className="p-4 bg-surface-container-low rounded-xl space-y-1 text-xs">
            <p className="font-bold text-base text-primary">${selectedInvoice?.amountUSD} USD</p>
            <p className="text-on-surface-variant">{(selectedInvoice?.amountCDF || 0).toLocaleString()} FC au taux du jour</p>
            <p className="text-on-surface-variant">{selectedInvoice?.tranche} • Année {selectedInvoice?.academicYear}</p>
          </div>

          <Select
            label="Mode de Paiement Mobile Money *"
            options={['M-Pesa RDC', 'Orange Money RDC', 'Airtel Money RDC', 'Espèces (Caisse Scolaire)']}
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          />

          <p className="text-[10px] text-on-surface-variant bg-surface-container p-3 rounded-lg">
            📱 Vous recevrez un code de confirmation par SMS sur le numéro enregistré. Un reçu officiel numérique sera généré automatiquement après validation.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setSelectedInvoice(null)}>
              Annuler
            </Button>
            <Button variant="accent" type="submit" icon="check_circle" isLoading={isProcessing}>
              Confirmer le Paiement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
