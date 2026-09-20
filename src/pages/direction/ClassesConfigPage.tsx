import React, { useState, useEffect } from 'react';
import { classService } from '../../services/api';
import { ClassSection } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';

export interface ClassesConfigPageProps {}

type FormMode = 'create' | 'edit';

// Préfixes disponibles selon le niveau
const PREFIX_BY_LEVEL: Record<string, string[]> = {
  'Primaire':   ['1ère', '2ème', '3ème', '4ème', '5ème', '6ème'],
  'Secondaire': ['1ère', '2ème'],
  'Humanités':  ['3ème', '4ème', '5ème', '6ème'],
};
const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const ClassesConfigPage: React.FC<ClassesConfigPageProps> = () => {
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // État du modal "Générer Plusieurs Classes"
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkLevel, setBulkLevel] = useState('Humanités');
  const [bulkStream, setBulkStream] = useState('Scientifique');
  const [bulkPrefixes, setBulkPrefixes] = useState<string[]>([]);
  const [bulkUpTo, setBulkUpTo] = useState('B');
  const [bulkCapacity, setBulkCapacity] = useState('40');
  const [bulkRoom, setBulkRoom] = useState('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  // Form fields
  const [newClassName, setNewClassName] = useState('');
  const [newLevel, setNewLevel] = useState<string>('Humanités');
  const [newStream, setNewStream] = useState('Scientifique');
  const [newCapacity, setNewCapacity] = useState('40');
  const [newRoom, setNewRoom] = useState('Bâtiment B - Salle 16');
  const [newTeacher, setNewTeacher] = useState('M. Jean-Paul Kasongo');

  const { notify } = useNotification();

  useEffect(() => {
    const fetch = async () => {
      const data = await classService.getClasses();
      setClasses(data);
    };
    fetch();
  }, []);

  const resetForm = () => {
    setNewClassName('');
    setNewLevel('Humanités');
    setNewStream('Scientifique');
    setNewCapacity('40');
    setNewRoom('Bâtiment B - Salle 16');
    setNewTeacher('M. Jean-Paul Kasongo');
    setEditingId(null);
    setFormMode('create');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassSection) => {
    setFormMode('edit');
    setEditingId(cls.id);
    setNewClassName(cls.name);
    setNewLevel(cls.level || 'Humanités');
    setNewStream(cls.stream || 'Scientifique');
    setNewCapacity(String(cls.capacity || 40));
    setNewRoom(cls.room || '');
    setNewTeacher(cls.mainTeacher || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    const formData = {
      name: newClassName,
      level: newLevel as any,
      stream: newStream as any,
      capacity: parseInt(newCapacity) || 40,
      room: newRoom,
      mainTeacher: newTeacher,
    };

    setIsSaving(true);
    try {
      if (formMode === 'create') {
        const created = await classService.createClass(formData);
        setClasses(prev => [...prev, created]);
        notify('success', 'Classe Créée !', `La classe ${newClassName} a été ajoutée à la structure pédagogique.`);
      } else if (formMode === 'edit' && editingId) {
        const updated = await classService.updateClass(editingId, formData);
        setClasses(prev => prev.map(c => c.id === editingId ? updated : c));
        notify('success', 'Classe Modifiée !', `La classe ${newClassName} a été mise à jour.`);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      notify('error', 'Erreur', 'Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cls: ClassSection) => {
    const confirmed = window.confirm(
      `Supprimer la classe "${cls.name}" ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    try {
      await classService.deleteClass(cls.id);
      setClasses(prev => prev.filter(c => c.id !== cls.id));
      notify('success', 'Classe Supprimée', `La classe ${cls.name} a été supprimée.`);
    } catch (err) {
      notify('error', 'Erreur', 'Impossible de supprimer la classe. Veuillez réessayer.');
      console.error(err);
    }
  };

  // ── Génération en batch ───────────────────────────────────────────────────
  const openBulkModal = () => {
    setBulkLevel('Humanités');
    setBulkStream('Scientifique');
    setBulkPrefixes([]);
    setBulkUpTo('B');
    setBulkCapacity('40');
    setBulkRoom('');
    setBulkResult(null);
    setIsBulkModalOpen(true);
  };

  const toggleBulkPrefix = (prefix: string) => {
    setBulkPrefixes(prev =>
      prev.includes(prefix) ? prev.filter(p => p !== prefix) : [...prev, prefix]
    );
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkPrefixes.length === 0) {
      notify('error', 'Sélection vide', 'Cochez au moins un préfixe de classe.');
      return;
    }

    // Lettres de A jusqu'à bulkUpTo
    const letters = SECTION_LETTERS.slice(0, SECTION_LETTERS.indexOf(bulkUpTo) + 1);
    // Toutes les combinaisons préfixe × lettre
    const combinations: { prefix: string; letter: string }[] = [];
    for (const prefix of bulkPrefixes) {
      for (const letter of letters) {
        combinations.push({ prefix, letter });
      }
    }

    setIsBulkSaving(true);
    setBulkResult(null);
    let created = 0;
    let failed = 0;
    const newClasses: ClassSection[] = [];

    for (const { prefix, letter } of combinations) {
      const name = `${prefix} ${bulkStream} ${letter}`;
      try {
        const cls = await classService.createClass({
          name,
          level: bulkLevel as any,
          stream: bulkStream as any,
          capacity: parseInt(bulkCapacity) || 40,
          room: bulkRoom || undefined as any,
          mainTeacher: '' as any,
        });
        newClasses.push(cls);
        created++;
      } catch {
        failed++;
      }
    }

    setClasses(prev => [...prev, ...newClasses]);
    setIsBulkSaving(false);

    const summary = failed === 0
      ? `${created} classe(s) générée(s) avec succès.`
      : `${created} classe(s) créée(s), ${failed} échec(s).`;
    setBulkResult(summary);
    notify('success', 'Génération terminée', summary);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Configuration &amp; Répartition des Classes
          </h1>
          <p className="text-xs text-on-surface-variant">
            Structure pédagogique, attribution des salles de cours et désignation des professeurs titulaires
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon="auto_awesome" onClick={openBulkModal}>
            Générer Plusieurs Classes
          </Button>
          <Button variant="accent" size="sm" icon="add" onClick={openCreateModal}>
            Créer une Nouvelle Classe
          </Button>
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map(cls => {
          const capacity = cls.capacity || 40;
          const enrolled = cls.enrolled || 0;
          const occupancyRate = Math.round((enrolled / capacity) * 100);
          return (
            <Card key={cls.id} noPadding className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-primary">{cls.name}</h3>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {cls.level} {cls.stream ? `• ${cls.stream}` : ''}
                    </span>
                  </div>
                  {cls.room && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary-fixed text-primary">
                      {cls.room}
                    </span>
                  )}
                </div>

                {/* Capacity progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface-variant">Effectif :</span>
                    <span className="text-primary font-bold">{enrolled} / {capacity} élèves</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyRate >= 95 ? 'bg-error' : occupancyRate >= 80 ? 'bg-secondary-container' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Main Teacher */}
                <div className="pt-3 border-t border-outline-variant/60 flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-primary text-base">person</span>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block uppercase font-semibold">Professeur Titulaire</span>
                    <span className="font-bold text-on-surface">{cls.mainTeacher || 'Non assigné'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2 border-t border-outline-variant/50 mt-4">
                <Button variant="outline" size="sm" fullWidth icon="edit" onClick={() => openEditModal(cls)}>
                  Modifier
                </Button>
                <Button variant="ghost" size="sm" icon="schedule" title="Voir l'emploi du temps">
                  Horaire
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="delete"
                  title="Supprimer la classe"
                  onClick={() => handleDelete(cls)}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Create / Edit Class */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={formMode === 'create' ? 'Ajouter une Nouvelle Classe' : 'Modifier la Classe'}
        subtitle={formMode === 'create' ? 'Définissez les paramètres de la division scolaire' : 'Mettez à jour les informations de la classe'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Intitulé de la classe *"
            placeholder="ex: 4ème Scientifique C"
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Niveau *"
              options={['Primaire', 'Secondaire', 'Humanités']}
              value={newLevel}
              onChange={e => setNewLevel(e.target.value)}
            />
            <Select
              label="Section / Filière *"
              options={['Scientifique', 'Littéraire', 'Commerciale & Gestion', 'Pédagogie Générale', 'Technique']}
              value={newStream}
              onChange={e => setNewStream(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Capacité Max *"
              type="number"
              value={newCapacity}
              onChange={e => setNewCapacity(e.target.value)}
              required
            />
            <Input
              label="Salle Affectée *"
              value={newRoom}
              onChange={e => setNewRoom(e.target.value)}
              required
            />
          </div>

          <Input
            label="Professeur Titulaire"
            value={newTeacher}
            onChange={e => setNewTeacher(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={formMode === 'create' ? 'add_circle' : 'save'}
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement…' : formMode === 'create' ? 'Créer la Classe' : 'Enregistrer les Modifications'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Générer Plusieurs Classes */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Générer Plusieurs Classes"
        subtitle="Créez toutes les sections d'un niveau en une seule opération"
      >
        <form onSubmit={handleBulkGenerate} className="space-y-5">

          {/* Niveau + Filière */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Niveau *"
              options={['Primaire', 'Secondaire', 'Humanités']}
              value={bulkLevel}
              onChange={e => {
                setBulkLevel(e.target.value);
                setBulkPrefixes([]);
              }}
            />
            <Select
              label="Section / Filière *"
              options={['Scientifique', 'Littéraire', 'Commerciale & Gestion', 'Pédagogie Générale', 'Technique']}
              value={bulkStream}
              onChange={e => setBulkStream(e.target.value)}
            />
          </div>

          {/* Préfixes à cocher */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
              Années / Préfixes à inclure *
            </p>
            <div className="flex flex-wrap gap-2">
              {(PREFIX_BY_LEVEL[bulkLevel] || []).map(prefix => {
                const checked = bulkPrefixes.includes(prefix);
                return (
                  <label
                    key={prefix}
                    className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all select-none ${
                      checked
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleBulkPrefix(prefix)}
                    />
                    {checked && <span className="material-symbols-outlined text-[14px]">check</span>}
                    {prefix}
                  </label>
                );
              })}
            </div>
            {bulkPrefixes.length > 0 && (
              <p className="text-[11px] text-primary mt-1.5">
                {bulkPrefixes.length} préfixe(s) sélectionné(s)
              </p>
            )}
          </div>

          {/* Sections parallèles */}
          <div>
            <Select
              label="Sections parallèles (de A jusqu'à…) *"
              options={SECTION_LETTERS}
              value={bulkUpTo}
              onChange={e => setBulkUpTo(e.target.value)}
            />
            <p className="text-[11px] text-on-surface-variant mt-1">
              Génère les sections&nbsp;
              <span className="font-bold text-primary">
                {SECTION_LETTERS.slice(0, SECTION_LETTERS.indexOf(bulkUpTo) + 1).join(', ')}
              </span>
            </p>
          </div>

          {/* Capacité + Salle */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Capacité par défaut"
              type="number"
              value={bulkCapacity}
              onChange={e => setBulkCapacity(e.target.value)}
            />
            <Input
              label="Salle par défaut"
              placeholder="ex: Bâtiment A"
              value={bulkRoom}
              onChange={e => setBulkRoom(e.target.value)}
            />
          </div>

          {/* Aperçu du nombre de classes */}
          {bulkPrefixes.length > 0 && (
            <div className="rounded-lg bg-primary/8 border border-primary/20 px-4 py-3 text-sm">
              <span className="font-semibold text-primary">
                {bulkPrefixes.length * (SECTION_LETTERS.indexOf(bulkUpTo) + 1)} classe(s) seront créées
              </span>
              <span className="text-on-surface-variant ml-1">
                ({bulkPrefixes.join(', ')} × {SECTION_LETTERS.slice(0, SECTION_LETTERS.indexOf(bulkUpTo) + 1).join('')})
              </span>
            </div>
          )}

          {/* Résumé après génération */}
          {bulkResult && (
            <div className="rounded-lg bg-secondary-container/40 border border-secondary/30 px-4 py-3 text-sm font-semibold text-on-secondary-container">
              <span className="material-symbols-outlined text-base align-middle mr-1">check_circle</span>
              {bulkResult}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsBulkModalOpen(false)}>
              {bulkResult ? 'Fermer' : 'Annuler'}
            </Button>
            {!bulkResult && (
              <Button
                variant="primary"
                type="submit"
                icon="auto_awesome"
                disabled={isBulkSaving || bulkPrefixes.length === 0}
              >
                {isBulkSaving ? 'Génération en cours…' : 'Générer'}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
