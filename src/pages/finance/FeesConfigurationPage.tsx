import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';
import { feeService } from '../../services/api';
import { FeeItem } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export interface FeesConfigurationPageProps {}

export const FeesConfigurationPage: React.FC<FeesConfigurationPageProps> = () => {
  const { notify } = useNotification();

  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    const fetchFees = async () => {
      try {
        const data = await feeService.getFeeItems();
        setFees(data);
      } catch (err: any) {
        notify('error', 'Erreur', err.message || 'Impossible de charger les frais.');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [notify]);

  const updateFee = (id: string, key: keyof FeeItem, val: string | number) => {
    setFees(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const addRow = () => {
    const newItem: FeeItem = {
      id: `temp-${Date.now()}`,
      schoolId: '', // will be set by service
      name: '',
      section: 'Toutes Sections',
      tranche1: 0,
      tranche2: 0,
      tranche3: 0,
      createdAt: new Date().toISOString()
    };
    setFees([...fees, newItem]);
  };

  const handleDelete = async (id: string) => {
    if (!id.startsWith('temp-')) {
      try {
        await feeService.deleteFeeItem(id);
      } catch (err) {
        notify('error', 'Erreur', 'Impossible de supprimer ce frais.');
        return;
      }
    }
    setFees(prev => prev.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const fee of fees) {
        const payload = { ...fee };
        if (payload.id.startsWith('temp-')) {
          delete (payload as any).id; // Let the backend generate ID
        }
        await feeService.saveFeeItem(payload);
      }
      notify('success', 'Grille Tarifaire Sauvegardée', "Les nouveaux montants sont enregistrés.");
      const refreshed = await feeService.getFeeItems();
      setFees(refreshed);
    } catch (err: any) {
      notify('error', 'Erreur', err.message || 'Échec de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Chargement des frais..." />;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Configuration de la Grille Tarifaire Scolaire
          </h1>
          <p className="text-xs text-on-surface-variant">
            Montants officiels en USD • Homologués par le MINAS et conforme aux directives gouvernementales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon="add" onClick={addRow}>
            Ajouter une ligne
          </Button>
          <Button variant="accent" size="sm" icon="save" onClick={handleSave} isLoading={isSaving}>
            Enregistrer la Grille
          </Button>
        </div>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant">
                <th className="p-3">Désignation des Frais</th>
                <th className="p-3">Section Concernée</th>
                <th className="p-3 w-36 text-center">Tranche 1 (Oct.) — USD</th>
                <th className="p-3 w-36 text-center">Tranche 2 (Fév.) — USD</th>
                <th className="p-3 w-36 text-center">Tranche 3 (Mai) — USD</th>
                <th className="p-3 text-right w-28">Total/An (USD)</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {fees.map(fee => (
                <tr key={fee.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-3">
                    <input
                      type="text"
                      className="w-full h-8 px-2 text-sm bg-white border border-outline-variant rounded focus:border-primary focus:ring-1"
                      value={fee.name}
                      onChange={e => updateFee(fee.id, 'name', e.target.value)}
                      placeholder="Désignation"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      className="w-full h-8 px-2 text-sm bg-white border border-outline-variant rounded focus:border-primary focus:ring-1"
                      value={fee.section || ''}
                      onChange={e => updateFee(fee.id, 'section', e.target.value)}
                      placeholder="Toutes Sections"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      className="w-28 h-8 px-2 text-center font-bold text-sm bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary"
                      value={fee.tranche1 || 0}
                      onChange={e => updateFee(fee.id, 'tranche1', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      className="w-28 h-8 px-2 text-center font-bold text-sm bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary"
                      value={fee.tranche2 || 0}
                      onChange={e => updateFee(fee.id, 'tranche2', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      className="w-28 h-8 px-2 text-center font-bold text-sm bg-white border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary"
                      value={fee.tranche3 || 0}
                      onChange={e => updateFee(fee.id, 'tranche3', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-3 text-right font-black text-primary">
                    ${(fee.tranche1 || 0) + (fee.tranche2 || 0) + (fee.tranche3 || 0)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(fee.id)}
                      className="text-error hover:text-error-dark p-1"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
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
