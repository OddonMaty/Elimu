import React, { useState, useEffect } from 'react';
import { schoolService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useNotification } from '../../context/NotificationContext';

export interface SchoolOptionsPageProps {}

export const SchoolOptionsPage: React.FC<SchoolOptionsPageProps> = () => {
  const { notify } = useNotification();
  const [sections, setSections] = useState<string[]>([]);
  const [schoolId, setSchoolId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSection, setNewSection] = useState('');

  useEffect(() => {
    const load = async () => {
      const school = await schoolService.getMySchool();
      setSections(school?.sections ?? []);
      setSchoolId(school?.id);
      setIsLoading(false);
    };
    load();
  }, []);

  const save = async (updatedSections: string[]) => {
    setIsSaving(true);
    try {
      await schoolService.updateMySchool({ sections: updatedSections });
    } catch (err) {
      notify('error', 'Erreur', 'Impossible de sauvegarder. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (section: string) => {
    const updated = sections.filter(s => s !== section);
    setSections(updated);
    await save(updated);
    notify('info', 'Filière désactivée', `"${section}" a été retirée des filières actives.`);
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSection.trim();
    if (!trimmed) return;
    if (sections.includes(trimmed)) {
      notify('error', 'Doublon', `La filière "${trimmed}" est déjà dans la liste.`);
      return;
    }
    const updated = [...sections, trimmed];
    setSections(updated);
    setNewSection('');
    await save(updated);
    notify('success', 'Filière ajoutée', `"${trimmed}" a été ajoutée aux filières actives.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Configuration des Options &amp; Filières Scolaires
          </h1>
          <p className="text-xs text-on-surface-variant">
            Filières actives de votre établissement — les sections désactivées n'apparaissent plus dans les listes de l'application
          </p>
        </div>
      </div>

      {/* Ajout rapide d'une filière */}
      <form onSubmit={handleAddSection} className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="+ Ajouter une filière"
            placeholder="ex: Pédagogie Générale"
            value={newSection}
            onChange={e => setNewSection(e.target.value)}
          />
        </div>
        <Button
          variant="accent"
          type="submit"
          icon="add"
          size="sm"
          disabled={isSaving || !newSection.trim()}
        >
          Ajouter
        </Button>
      </form>

      {/* Liste des filières */}
      {isLoading ? (
        <p className="text-sm text-on-surface-variant">Chargement…</p>
      ) : sections.length === 0 ? (
        <Card noPadding className="p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">school</span>
          <p className="text-sm text-on-surface-variant">
            Aucune filière configurée. Ajoutez-en une ci-dessus ou depuis les <strong>Paramètres Généraux</strong>.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <Card key={`${section}-${idx}`} noPadding className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">bookmark</span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">{section}</h3>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  icon="remove_circle_outline"
                  disabled={isSaving}
                  onClick={() => handleDeactivate(section)}
                >
                  Désactiver
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
