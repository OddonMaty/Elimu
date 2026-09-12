import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { financeService } from '../../services/api';
import { TuitionInvoice } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface BillingDashboardPageProps {}

export const BillingDashboardPage: React.FC<BillingDashboardPageProps> = () => {
  const [invoices, setInvoices] = useState<TuitionInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await financeService.getInvoices();
      setInvoices(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const totalRevenue = invoices.filter(i => i.status === 'PAYE').reduce((s, i) => s + i.amountUSD, 0);
  const totalPending = invoices.filter(i => i.status === 'EN_ATTENTE').reduce((s, i) => s + i.amountUSD, 0);
  const collectionRate = invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'PAYE').length / invoices.length) * 100) : 0;

  if (loading) return <LoadingSpinner message="Chargement du tableau de bord financier..." />;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Tableau de Bord Financier & Comptabilité Scolaire
          </h1>
          <p className="text-xs text-on-surface-variant">
            Suivi des encaissements, recouvrements et état de trésorerie en temps réel
          </p>
        </div>
        <Link to="/finance/config">
          <Button variant="outline" size="sm" icon="tune">
            Configurer les Frais
          </Button>
        </Link>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card noPadding className="p-5 bg-gradient-to-br from-primary to-[#1b3b5f] text-white rounded-xl shadow-md">
          <span className="text-[10px] uppercase font-bold text-white/70 block">Recettes Encaissées (A.S.)</span>
          <span className="text-3xl font-black block mt-1">${totalRevenue.toLocaleString()} USD</span>
          <span className="text-xs text-white/60 block mt-0.5">{(totalRevenue * 2850).toLocaleString()} FC</span>
          <div className="mt-3 flex items-center gap-1 text-xs text-white/80">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            Taux de recouvrement : {collectionRate}%
          </div>
        </Card>

        <Card noPadding className="p-5 bg-surface-container-lowest border-l-4 border-l-warning">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Créances en Attente</span>
          <span className="text-3xl font-black text-warning block mt-1">${totalPending.toLocaleString()} USD</span>
          <span className="text-xs text-on-surface-variant">{invoices.filter(i => i.status === 'EN_ATTENTE').length} factures non soldées</span>
        </Card>

        <Card noPadding className="p-5 bg-surface-container-lowest border-l-4 border-l-primary">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Élèves en Règle</span>
          <span className="text-3xl font-black text-primary block mt-1">{collectionRate}%</span>
          <span className="text-xs text-on-surface-variant">{invoices.filter(i => i.status === 'PAYE').length}/{invoices.length} dossiers soldés</span>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card title="Dernières Transactions Enregistrées" subtitle="Journal des encaissements">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                <th className="p-3">N° Facture</th>
                <th className="p-3">Élève</th>
                <th className="p-3">Tranche</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-primary">{inv.invoiceNumber}</td>
                  <td className="p-3 font-medium text-on-surface">{inv.studentName}</td>
                  <td className="p-3 text-on-surface-variant">{inv.tranche}</td>
                  <td className="p-3 font-bold text-primary">${inv.amountUSD}</td>
                  <td className="p-3 text-on-surface-variant">{inv.paymentMethod || '—'}</td>
                  <td className="p-3 font-mono text-on-surface-variant">{inv.paymentDate || inv.dueDate}</td>
                  <td className="p-3 text-center">
                    <Badge variant={inv.status === 'PAYE' ? 'success' : 'warning'} size="sm" dot>
                      {inv.status === 'PAYE' ? 'Encaissé' : 'En attente'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
