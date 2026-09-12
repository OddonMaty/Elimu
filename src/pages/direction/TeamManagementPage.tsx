import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';
import { invitationService } from '../../services/api';
import { AccountInvitation, UserRole } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export const TeamManagementPage: React.FC = () => {
  const { notify } = useNotification();
  const { currentUser } = useAuth();
  const [invitations, setInvitations] = useState<AccountInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher' as UserRole
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      setLoading(true);
      try {
        const data = await invitationService.getInvitations();
        setInvitations(data.filter(inv => inv.role !== 'parent'));
      } catch (err: any) {
        notify('error', 'Erreur', err.message || 'Impossible de charger les invitations.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();
  }, [notify]);

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      notify('error', 'Erreur', 'Le nom est obligatoire.');
      return;
    }

    setIsGenerating(true);
    const code = generateRandomCode();

    try {
      const newInv = await invitationService.generateInvitation({
        code,
        role: formData.role,
        intendedName: formData.name,
        intendedEmail: formData.email,
        intendedPhone: formData.phone
      });
      
      // Attempt to send email
      if (formData.email && supabase) {
        try {
          await supabase.functions.invoke('send-invitation-email', {
            body: {
              email: formData.email,
              name: formData.name,
              role: formData.role,
              schoolName: currentUser?.schoolName || 'votre école',
              code,
              appUrl: window.location.origin
            }
          });
        } catch (emailErr) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailErr);
          // Don't block the UI if email fails
        }
      }

      setInvitations([newInv, ...invitations]);
      setNewInviteCode(code);
      setFormData({ name: '', email: '', phone: '', role: 'teacher' });
      notify('success', 'Invitation générée', 'Le code d\'activation a été créé avec succès.');
    } catch (err: any) {
      notify('error', 'Erreur', err.message || 'Impossible de générer l\'invitation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getWhatsAppText = (inv: AccountInvitation) => {
    const link = `${window.location.origin}/activer?code=${inv.code}`;
    return `Bonjour ${inv.intendedName},\n\nVoici votre code d'activation pour accéder à la plateforme Elimu de l'école :\n*${inv.code}*\n\nRendez-vous sur ${link} pour créer votre compte et vous connecter.\n\nÀ bientôt !`;
  };

  const handleCopy = (inv: AccountInvitation) => {
    navigator.clipboard.writeText(getWhatsAppText(inv));
    notify('info', 'Copié', 'Le message d\'invitation a été copié dans le presse-papier.');
  };

  const openWhatsApp = (inv: AccountInvitation) => {
    if (!inv.intendedPhone) return;
    const cleanPhone = inv.intendedPhone.replace(/\s+/g, '');
    const encodedText = encodeURIComponent(getWhatsAppText(inv));
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">Gestion de l'Équipe</h1>
        <p className="text-sm text-on-surface-variant">Invitez vos enseignants et le personnel administratif à rejoindre la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Nouvelle Invitation" subtitle="Générer un code d'activation">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md focus:outline-none focus:border-primary text-sm"
                  placeholder="Ex: Jean Mukendi"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md focus:outline-none focus:border-primary text-sm"
                    placeholder="+243..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md focus:outline-none focus:border-primary text-sm"
                    placeholder="Facultatif"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Rôle
                </label>
                <Select
                  options={[
                    { label: 'Enseignant', value: 'teacher' },
                    { label: 'Secrétariat', value: 'secretariat' },
                    { label: 'Trésorerie / Caisse', value: 'tresorerie' },
                    { label: 'Proviseur', value: 'proviseur' }
                  ]}
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" fullWidth isLoading={isGenerating}>
                  Générer le Code
                </Button>
              </div>
            </form>
          </Card>

          {newInviteCode && (
            <div className="p-4 bg-success/10 border border-success rounded-xl text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-sm font-bold text-success-dark">Code Généré avec Succès !</p>
              <div className="bg-white px-4 py-2 rounded-lg border-2 border-dashed border-success text-2xl font-black tracking-[0.2em] text-center">
                {newInviteCode}
              </div>
              <p className="text-xs text-on-surface-variant">
                Transmettez ce code au collaborateur. Il devra le saisir sur la page d'activation.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Invitations Envoyées" subtitle="Historique et statuts d'activation">
            {loading ? (
              <LoadingSpinner message="Chargement..." />
            ) : invitations.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant border-2 border-dashed rounded-lg">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">group_add</span>
                <p>Aucune invitation générée pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map(inv => (
                  <div key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-xl gap-4 hover:shadow-sm transition-shadow">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{inv.intendedName}</span>
                        <Badge variant={inv.role === 'teacher' ? 'info' : (inv.role === 'proviseur' ? 'primary' : 'neutral')} size="sm">
                          {inv.role === 'teacher' ? 'Enseignant' : (inv.role === 'secretariat' ? 'Secrétariat' : (inv.role === 'tresorerie' ? 'Trésorerie' : 'Proviseur'))}
                        </Badge>
                      </div>
                      <div className="text-xs text-on-surface-variant flex gap-3">
                        {inv.intendedPhone && <span>{inv.intendedPhone}</span>}
                        {inv.intendedEmail && <span>{inv.intendedEmail}</span>}
                        <span>Créé le: {new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-center px-3 py-1.5 bg-surface-container rounded-lg border">
                        <span className="block text-[10px] font-bold text-on-surface-variant uppercase">Code</span>
                        <span className="font-mono font-bold text-primary tracking-widest">{inv.code}</span>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={inv.used ? 'success' : 'warning'} size="sm">
                          {inv.used ? 'Activé' : 'En attente'}
                        </Badge>
                        {!inv.used && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCopy(inv)}
                              className="text-xs text-primary hover:underline flex items-center gap-1 font-bold"
                              title="Copier le message"
                            >
                              <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            </button>
                            {inv.intendedPhone && (
                              <button
                                onClick={() => openWhatsApp(inv)}
                                className="text-xs text-[#25D366] hover:underline flex items-center gap-1 font-bold"
                                title="Envoyer par WhatsApp"
                              >
                                <span className="material-symbols-outlined text-[14px]">send</span>
                                WhatsApp
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
