import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/api';
import { TuitionInvoice } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';

export interface TuitionTrackingPageProps {}

export const TuitionTrackingPage: React.FC<TuitionTrackingPageProps> = () => {
  const [invoices, setInvoices] = useState<TuitionInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTranche, setFilterTranche] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<TuitionInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Espèces (Caisse)');
  const [cashAmount, setCashAmount] = useState('250');
  const { notify } = useNotification();

  useEffect(() => {
    const fetch = async () => {
      const data = await financeService.getInvoices();
      setInvoices(data);
    };
    fetch();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTranche = filterTranche === 'ALL' || inv.tranche === filterTranche;
    return matchesSearch && matchesTranche;
  });

  const handleCashPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    await financeService.payInvoice(selectedInvoice.id, paymentMethod);
    setInvoices(prev => prev.map(i => i.id === selectedInvoice.id ? { ...i, status: 'PAYE', paymentMethod: paymentMethod as any, paymentDate: new Date().toISOString().split('T')[0] } : i));
    setSelectedInvoice(null);
    notify('success', 'Paiement Encaissé', `Le versement de $${cashAmount} USD pour ${selectedInvoice.studentName} a été validé.`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Suivi des Frais Scolaires & Caisse Centrale
          </h1>
          <p className="text-xs text-on-surface-variant">
            Journal des encaissements (Minerval, Tranches 1/2/3) et état financier par élève
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon="download" onClick={() => window.print()}>
            Exporter le Journal
          </Button>
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card noPadding className="p-4 bg-surface-container-lowest border-l-4 border-l-success">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Total Encaissé</span>
          <span className="text-2xl font-black text-success mt-1 block">$1,450.00 USD</span>
          <span className="text-[10px] text-on-surface-variant">4,132,500 FC enregistrés</span>
        </Card>
        <Card noPadding className="p-4 bg-surface-container-lowest border-l-4 border-l-secondary-container">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">En Attente de Recouvrement</span>
          <span className="text-2xl font-black text-primary mt-1 block">$250.00 USD</span>
          <span className="text-[10px] text-on-surface-variant">1 facture en cours</span>
        </Card>
        <Card noPadding className="p-4 bg-surface-container-lowest border-l-4 border-l-primary">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Taux d'Apurement</span>
          <span className="text-2xl font-black text-primary mt-1 block">85.3%</span>
          <span className="text-[10px] text-success font-semibold">Dans les délais fixés</span>
        </Card>
      </div>

      {/* Filters */}
      <Card noPadding className="p-4 bg-surface-container-lowest flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <Input
            placeholder="Rechercher par élève, matricule, parent..."
            icon="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            options={[
              { value: 'ALL', label: 'Toutes les Tranches' },
              { value: 'Tranche 1', label: 'Tranche 1 (Octobre)' },
              { value: 'Tranche 2', label: 'Tranche 2 (Février)' },
              { value: 'Tranche 3', label: 'Tranche 3 (Mai)' }
            ]}
            value={filterTranche}
            onChange={e => setFilterTranche(e.target.value)}
          />
        </div>
      </Card>

      {/* Invoices Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                <th className="p-3.5">N° Facture</th>
                <th className="p-3.5">Élève & Matricule</th>
                <th className="p-3.5">Classe</th>
                <th className="p-3.5">Tranche</th>
                <th className="p-3.5">Montant USD</th>
                <th className="p-3.5">Mode / Date</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-primary">{inv.invoiceNumber}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-on-surface block">{inv.studentName}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant">{inv.matricule}</span>
                  </td>
                  <td className="p-3.5 font-medium">{inv.className}</td>
                  <td className="p-3.5 font-semibold text-primary">{inv.tranche}</td>
                  <td className="p-3.5 font-bold text-sm text-primary">
                    ${inv.amountUSD}.00
                    <span className="block text-[10px] text-on-surface-variant font-normal">{inv.amountCDF.toLocaleString()} FC</span>
                  </td>
                  <td className="p-3.5 text-on-surface-variant">
                    {inv.status === 'PAYE' ? (
                      <>
                        <span className="font-bold text-on-surface block">{inv.paymentMethod}</span>
                        <span className="text-[10px] font-mono">{inv.paymentDate}</span>
                      </>
                    ) : (
                      <span className="text-warning font-semibold">Échéance: {inv.dueDate}</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <Badge variant={inv.status === 'PAYE' ? 'success' : 'warning'} size="sm" dot>
                      {inv.status === 'PAYE' ? 'Encaissé' : 'En attente'}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    {inv.status === 'EN_ATTENTE' ? (
                      <Button
                        variant="accent"
                        size="sm"
                        icon="point_of_sale"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setCashAmount(inv.amountUSD.toString());
                        }}
                      >
                        Encaisser
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" icon="receipt" title="Voir reçu">
                        Reçu
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Cash Payment */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Encaisser un Paiement de Frais"
        subtitle={`Facture ${selectedInvoice?.invoiceNumber} pour ${selectedInvoice?.studentName}`}
      >
        <form onSubmit={handleCashPayment} className="space-y-4">
          <div className="p-3 bg-surface-container-low rounded-lg space-y-1 text-xs">
            <p><strong>Élève :</strong> {selectedInvoice?.studentName} ({selectedInvoice?.className})</p>
            <p><strong>Désignation :</strong> {selectedInvoice?.tranche} - Année {selectedInvoice?.academicYear}</p>
            <p><strong>Montant exigible :</strong> <span className="font-bold text-primary">${selectedInvoice?.amountUSD} USD</span> ({selectedInvoice?.amountCDF.toLocaleString()} FC)</p>
          </div>

          <Select
            label="Canal d'Encaissement *"
            options={['Espèces (Caisse Scolaire)', 'M-Pesa RDC', 'Orange Money RDC', 'Airtel Money RDC', 'Bordereau Bancaire']}
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          />

          <Input
            label="Montant Encaissé (USD) *"
            type="number"
            value={cashAmount}
            onChange={e => setCashAmount(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" type="button" onClick={() => setSelectedInvoice(null)}>
              Annuler
            </Button>
            <Button variant="accent" type="submit" icon="check_circle">
              Valider l'Encaissement & Imprimer Reçu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
