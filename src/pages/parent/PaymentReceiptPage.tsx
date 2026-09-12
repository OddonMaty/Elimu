import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { financeService } from '../../services/api';
import { TuitionInvoice } from '../../types';
import { OfficialInvoice } from '../../components/official/OfficialInvoice';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface PaymentReceiptPageProps {}

export const PaymentReceiptPage: React.FC<PaymentReceiptPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<TuitionInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const all = await financeService.getInvoices();
      const found = all.find(i => i.id === (id || 'inv-001'));
      setInvoice(found || all[0]);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner message="Chargement du reçu de paiement..." />;
  if (!invoice) return null;

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Reçu Officiel de Paiement
          </h1>
          <p className="text-xs text-on-surface-variant">
            Reçu #{invoice.invoiceNumber} — Document fiscal officiel
          </p>
        </div>
        <Button variant="outline" size="sm" icon="print" onClick={() => window.print()}>
          Imprimer / Sauvegarder PDF
        </Button>
      </div>
      <OfficialInvoice invoice={invoice} />
    </div>
  );
};
