import React from 'react';
import { TuitionInvoice } from '../../types';
import { Button } from '../common/Button';

export interface OfficialInvoiceProps {
  readonly invoice: TuitionInvoice;
  readonly onPrint?: () => void;
  readonly schoolName?: string;
}

export const OfficialInvoice: React.FC<OfficialInvoiceProps> = ({
  invoice,
  onPrint = () => window.print(),
  schoolName = 'COLLÈGE BOBOTO - KINSHASA'
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between no-print bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
        <span className="text-xs font-semibold text-primary">Reçu de Paiement & Facture Officielle</span>
        <Button variant="outline" size="sm" icon="print" onClick={onPrint}>
          Imprimer le Reçu
        </Button>
      </div>

      <div className="bg-white text-black p-6 sm:p-8 rounded-lg border border-gray-300 shadow max-w-2xl mx-auto w-full font-sans text-xs space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-black uppercase text-blue-950">{schoolName}</h2>
            <p className="text-[10px] text-gray-500">Service de Comptabilité & Caisse Scolaire</p>
            <p className="text-[10px] text-gray-500">Kinshasa Gombe, République Démocratique du Congo</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-extrabold text-xs rounded border border-green-300">
              REÇU OFFICIEL : PAYÉ
            </span>
            <p className="text-[10px] font-mono font-bold mt-1 text-gray-600">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-500">Élève Bénéficiaire</p>
            <p className="font-bold text-sm text-gray-900">{invoice.studentName}</p>
            <p className="text-[11px] text-gray-600">Classe : {invoice.className}</p>
            <p className="text-[11px] font-mono text-blue-900">Matricule : {invoice.matricule}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-500">Détails du Versement</p>
            <p className="text-[11px] text-gray-700">Payeur : <strong>{invoice.parentName}</strong></p>
            <p className="text-[11px] text-gray-700">Date : <strong>{invoice.paymentDate || invoice.dueDate}</strong></p>
            <p className="text-[11px] text-gray-700">Canal : <strong>{invoice.paymentMethod || 'M-Pesa RDC'}</strong></p>
            <p className="text-[10px] font-mono text-gray-500">Réf. Transaction : {invoice.transactionReference || 'MP-99482910CD'}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-gray-300">
              <th className="p-2.5">Désignation</th>
              <th className="p-2.5">Année Scolaire</th>
              <th className="p-2.5 text-right">Montant (USD)</th>
              <th className="p-2.5 text-right">Équivalent (CDF)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-2.5 font-medium">{invoice.tranche} - Minerval & Frais d’Études</td>
              <td className="p-2.5">{invoice.academicYear}</td>
              <td className="p-2.5 text-right font-bold">${invoice.amountUSD}.00</td>
              <td className="p-2.5 text-right font-medium">{invoice.amountCDF.toLocaleString()} FC</td>
            </tr>
            <tr className="bg-gray-50 font-black text-sm">
              <td colSpan={2} className="p-3 uppercase text-blue-950">Total Payé Net</td>
              <td className="p-3 text-right text-blue-950 font-black">${invoice.amountUSD}.00</td>
              <td className="p-3 text-right text-blue-950 font-black">{invoice.amountCDF.toLocaleString()} FC</td>
            </tr>
          </tbody>
        </table>

        {/* Stamp & Footer */}
        <div className="flex items-center justify-between border-t pt-4 text-[10px] text-gray-500">
          <div>
            <p>Ce reçu électronique fait foi de paiement libératoire.</p>
            <p>Conservez ce document pour tout contrôle administratif.</p>
          </div>
          <div className="text-center p-2 border-2 border-dashed border-green-600 rounded text-green-700 font-bold uppercase text-[9px]">
            ✓ CAISSE CENTRALE ELIMU • ENCAISSÉ
          </div>
        </div>
      </div>
    </div>
  );
};
