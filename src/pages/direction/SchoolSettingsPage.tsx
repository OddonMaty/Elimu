import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useNotification } from '../../context/NotificationContext';
import { schoolService } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';

const AVAILABLE_EDUCATION_LEVELS = [
  'Maternelle',
  'Primaire',
  'Secondaire & Humanités'
] as const;

const STANDARD_SECTIONS = [
  'Scientifique (Bio-Chimie)',
  'Scientifique (Math-Physique)',
  'Littéraire (Latin-Philo)',
  'Commerciale & Gestion',
  'Pédagogie Générale',
  'Technique & Électronique',
  'Mécanique Générale',
  'Coupe & Couture',
  'Sociale & Hôtellerie'
];

export interface SchoolSettingsPageProps {}

export const SchoolSettingsPage: React.FC<SchoolSettingsPageProps> = () => {
  const { notify } = useNotification();

  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [currentTerm, setCurrentTerm] = useState('Semestre 1');

  const [annualTuitionMin, setAnnualTuitionMin] = useState<string>('');
  const [annualTuitionMax, setAnnualTuitionMax] = useState<string>('');
  const [educationLevels, setEducationLevels] = useState<('Maternelle' | 'Primaire' | 'Secondaire & Humanités')[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [newSectionInput, setNewSectionInput] = useState('');

  const [coverImage, setCoverImage] = useState<string>('');
  const [logoImage, setLogoImage] = useState<string>('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const school = await schoolService.getMySchool();
        if (school) {
          setName(school.name || '');
          setMotto(school.tagline || '');
          setDescription(school.description || '');
          setAddress(school.address || '');
          setPhone(school.phone || '');
          setEmail(school.email || '');
          if (school.currentAcademicYear) setAcademicYear(school.currentAcademicYear);
          if (school.currentTerm) setCurrentTerm(school.currentTerm);

          if (school.annualTuitionMinUSD != null) setAnnualTuitionMin(String(school.annualTuitionMinUSD));
          if (school.annualTuitionMaxUSD != null) setAnnualTuitionMax(String(school.annualTuitionMaxUSD));
          if (school.educationLevels) setEducationLevels(school.educationLevels);
          if (school.sections) setSections(school.sections);
          if (school.coverImage) setCoverImage(school.coverImage);
          if (school.logoImage) setLogoImage(school.logoImage);
        }
      } catch (err: any) {
        notify('error', 'Erreur', err.message || 'Impossible de charger les paramètres.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchool();
  }, [notify]);

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      if (supabase) {
        const timestamp = Date.now();
        const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `covers/${timestamp}_${sanitize(file.name)}`;

        const { data, error } = await supabase.storage
          .from('school-media')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('school-media')
          .getPublicUrl(data.path);

        setCoverImage(urlData.publicUrl);
        notify('success', 'Couverture Téléversée', 'L\'image de couverture a été mise à jour.');
      } else {
        const mockUrl = URL.createObjectURL(file);
        setCoverImage(mockUrl);
        notify('info', 'Prévisualisation', 'Image chargée en mode local.');
      }
    } catch (err: any) {
      notify('error', 'Erreur de téléversement', err.message || 'Impossible de téléverser l\'image.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Upload Logo Image
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      if (supabase) {
        const timestamp = Date.now();
        const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `logos/${timestamp}_${sanitize(file.name)}`;

        const { data, error } = await supabase.storage
          .from('school-media')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('school-media')
          .getPublicUrl(data.path);

        setLogoImage(urlData.publicUrl);
        notify('success', 'Logo Téléversé', 'Le logo officiel a été mis à jour.');
      } else {
        const mockUrl = URL.createObjectURL(file);
        setLogoImage(mockUrl);
        notify('info', 'Prévisualisation', 'Logo chargé en mode local.');
      }
    } catch (err: any) {
      notify('error', 'Erreur de téléversement', err.message || 'Impossible de téléverser le logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const toggleEducationLevel = (level: 'Maternelle' | 'Primaire' | 'Secondaire & Humanités') => {
    setEducationLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleSection = (sec: string) => {
    setSections(prev =>
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    );
  };

  const handleAddCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSectionInput.trim();
    if (!trimmed) return;
    if (!sections.includes(trimmed)) {
      setSections(prev => [...prev, trimmed]);
    }
    setNewSectionInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await schoolService.updateMySchool({
        name,
        tagline: motto,
        description,
        address,
        phone,
        email,
        currentAcademicYear: academicYear,
        currentTerm,
        annualTuitionMinUSD: annualTuitionMin !== '' ? Number(annualTuitionMin) : undefined,
        annualTuitionMaxUSD: annualTuitionMax !== '' ? Number(annualTuitionMax) : undefined,
        educationLevels,
        sections,
        coverImage,
        logoImage
      });
      notify('success', 'Paramètres Sauvegardés', 'Les modifications de l’établissement ont été enregistrées avec succès.');
    } catch (err: any) {
      notify('error', 'Erreur', err.message || 'Échec de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement des paramètres..." />;
  }

  const allSectionsList = Array.from(new Set([...STANDARD_SECTIONS, ...sections]));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Paramètres Généraux de l’Établissement
        </h1>
        <p className="text-xs text-on-surface-variant">
          Gérez l’identité publique, les médias, les filières organisées et les tarifs affichés sur la plateforme
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Medias & Visual Identity */}
        <Card title="Visuels & Médias de l'Établissement" subtitle="Image de couverture et logo officiel affichés dans l'annuaire">
          <div className="space-y-6">
            
            {/* Cover Image Upload */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-2">
                Image de Couverture (Bannière)
              </label>
              <div className="relative h-44 sm:h-56 w-full rounded-xl overflow-hidden border-2 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center group">
                {coverImage ? (
                  <>
                    <img src={coverImage} alt="Couverture" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon="photo_camera"
                        isLoading={isUploadingCover}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        Changer la couverture
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        icon="delete"
                        onClick={() => setCoverImage('')}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="material-symbols-outlined text-4xl text-primary mb-1">add_photo_alternate</span>
                    <p className="text-xs font-semibold text-on-surface">Aucune image de couverture définie</p>
                    <p className="text-[11px] text-on-surface-variant mb-3">Recommandé : 1200 x 400 px (JPEG, PNG ou WebP)</p>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon="upload"
                      isLoading={isUploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      Téléverser une Couverture
                    </Button>
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </div>
            </div>

            {/* Logo Image Upload */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-2">
                Logo Officiel / Armoiries de l'École
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                  {logoImage ? (
                    <img src={logoImage} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-primary">school</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon="upload"
                      isLoading={isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {logoImage ? 'Changer le Logo' : 'Téléverser le Logo'}
                    </Button>
                    {logoImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon="delete"
                        onClick={() => setLogoImage('')}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Format carré ou circulaire recommandé, fond transparent (PNG, SVG ou JPEG).
                  </p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>
            </div>

          </div>
        </Card>

        {/* Identity & Details */}
        <Card title="Identité de l'École & Coordonnées">
          <div className="space-y-4">
            <Input
              label="Nom Officiel de l’Établissement *"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <Input
              label="Devise / Slogan Institutionnel (Tagline)"
              placeholder="ex: Rigueur, Discipline et Excellence Académique"
              value={motto}
              onChange={e => setMotto(e.target.value)}
            />

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Présentation / Description de l’Établissement
              </label>
              <textarea
                className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[110px] leading-relaxed"
                placeholder="Rédigez l'histoire, la vision pédagogique, les valeurs ou les atouts de votre établissement pour les futurs parents d'élèves..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <span className="text-[10px] text-on-surface-variant">
                Ce texte s'affichera directement sur la fiche détaillée publique de votre école.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Adresse Physique Complète"
                placeholder="ex: Avenue de la Libération n°42, Gombe"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <Input
                label="Numéro de Téléphone Officiel"
                placeholder="+243 81 234 5678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <Input
              label="Adresse Email de Contact Officielle"
              type="email"
              placeholder="secretariat@ecole.cd"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </Card>

        {/* Annual Tuition Settings */}
        <Card title="Frais de Scolarité Annuels (Minerval)" subtitle="Fourchette indicative affichée aux parents pour la transparence">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Frais Annuels Minimum ($ USD)"
                type="number"
                min="0"
                step="5"
                placeholder="ex: 350"
                value={annualTuitionMin}
                onChange={e => setAnnualTuitionMin(e.target.value)}
              />
              <Input
                label="Frais Annuels Maximum ($ USD)"
                type="number"
                min="0"
                step="5"
                placeholder="ex: 600"
                value={annualTuitionMax}
                onChange={e => setAnnualTuitionMax(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Laissez vide si vous préférez afficher <em>« Tarifs non communiqués »</em> sur la vitrine publique.
            </p>
          </div>
        </Card>

        {/* Education Levels & Sections Checkboxes */}
        <Card title="Cycles d'Enseignement & Filières Organisées" subtitle="Sélectionnez les niveaux et sections agréés proposés par votre école">
          <div className="space-y-6">
            
            {/* Education Levels Checkboxes */}
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                1. Cycles d'Enseignement Organisés :
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AVAILABLE_EDUCATION_LEVELS.map(level => {
                  const checked = educationLevels.includes(level);
                  return (
                    <label
                      key={level}
                      onClick={() => toggleEducationLevel(level)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                        checked
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                          : 'border-outline-variant/70 bg-surface-container-low text-on-surface hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}} // handled by parent div
                        className="rounded border-outline text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs">{level}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sections Checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  2. Options & Filières Offertes (Humanités & Secondaire) :
                </h4>
                <span className="text-[11px] text-on-surface-variant">
                  {sections.length} section{sections.length > 1 ? 's' : ''} active{sections.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {allSectionsList.map(sec => {
                  const checked = sections.includes(sec);
                  return (
                    <label
                      key={sec}
                      onClick={() => toggleSection(sec)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                        checked
                          ? 'border-primary bg-primary/5 text-primary font-semibold shadow-xs'
                          : 'border-outline-variant/60 bg-surface-container-low/60 text-on-surface hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}} // handled by parent div
                        className="rounded border-outline text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs truncate" title={sec}>{sec}</span>
                    </label>
                  );
                })}
              </div>

              {/* Add custom section form */}
              <div className="pt-3 mt-3 border-t border-outline-variant/50 flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Ajouter une autre option spécifique (ex: Électronique Industrielle)..."
                    value={newSectionInput}
                    onChange={e => setNewSectionInput(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon="add"
                  onClick={handleAddCustomSection}
                >
                  Ajouter
                </Button>
              </div>
            </div>

          </div>
        </Card>

        {/* Academic Calendar Settings */}
        <Card title="Configuration de l'Année Scolaire & Périodes">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Année Scolaire Active"
              options={['2025 - 2026', '2026 - 2027']}
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
            />
            <Select
              label="Période / Semestre en Cours"
              options={['Semestre 1 (1ère & 2ème Période)', 'Semestre 2 (3ème & 4ème Période)', 'Délibérations Annuelles']}
              value={currentTerm}
              onChange={e => setCurrentTerm(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="accent" size="lg" type="submit" isLoading={isSaving} icon="save">
            Enregistrer Tous les Paramètres
          </Button>
        </div>
      </form>
    </div>
  );
};
