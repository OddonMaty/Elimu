import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useNotification } from '../../context/NotificationContext';

export interface NotificationConfigPageProps {}

interface NotificationRule {
  id: string;
  title: string;
  channel: 'SMS' | 'WhatsApp' | 'Email';
  trigger: string;
  template: string;
  enabled: boolean;
}

export const NotificationConfigPage: React.FC<NotificationConfigPageProps> = () => {
  const { notify } = useNotification();

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: 'r1',
      title: 'Alerte Absence Non Justifiée',
      channel: 'SMS',
      trigger: 'Dès que l’élève est marqué ABSENT lors de l’appel du matin (08h00)',
      template: 'Bonjour M/Mme {parent_name}. Votre enfant {student_name} est absent ce jour {date} au Collège Boboto. Merci de contacter le secrétariat.',
      enabled: true
    },
    {
      id: 'r2',
      title: 'Notification Retard en Classe',
      channel: 'SMS',
      trigger: 'Dès que l’élève est marqué RETARD à l’entrée de l’établissement',
      template: 'Info Collège : {student_name} est arrivé en retard à {time}. Merci de veiller à la ponctualité.',
      enabled: true
    },
    {
      id: 'r3',
      title: 'Rappel Échéance Frais Scolaires (Minerval)',
      channel: 'WhatsApp',
      trigger: '5 jours avant la date limite de paiement de la Tranche',
      template: 'Rappel Collège Boboto : La Tranche 2 des frais scolaires pour {student_name} expire le {due_date}. Montant : {amount_usd}$. Paiement Mobile Money disponible via l’application.',
      enabled: true
    },
    {
      id: 'r4',
      title: 'Confirmation de Paiement Encaissé',
      channel: 'SMS',
      trigger: 'Dès validation du versement en caisse ou par Mobile Money',
      template: 'Reçu #{ref_no} : Paiement de {amount_usd}$ bien reçu pour {student_name}. Merci de votre fidélité.',
      enabled: true
    },
    {
      id: 'r5',
      title: 'Publication du Bulletin Scolaire',
      channel: 'WhatsApp',
      trigger: 'Dès clôture des délibérations semestrielles',
      template: 'Le bulletin du 1er Semestre de {student_name} ({percentage}%) est disponible sur le portail parent Elimu.',
      enabled: true
    }
  ]);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const next = !r.enabled;
        notify('info', 'Règle modifiée', `L'alerte "${r.title}" est maintenant ${next ? 'activée' : 'suspendue'}.`);
        return { ...r, enabled: next };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Configuration des Notifications Automatiques aux Parents
          </h1>
          <p className="text-xs text-on-surface-variant">
            Passerelle SMS & WhatsApp RDC (Vodacom, Orange, Airtel) pour l'assiduité, les notes et les frais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md" icon="cell_tower">
            Passerelle SMS RDC : Connectée (Crédit : 14 500 SMS)
          </Badge>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule.id} noPadding className="p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-xl ${
                    rule.channel === 'WhatsApp' ? 'text-green-600' : 'text-primary'
                  }`}>
                    {rule.channel === 'WhatsApp' ? 'chat' : 'sms'}
                  </span>
                  <h3 className="font-extrabold text-sm text-primary">{rule.title}</h3>
                  <Badge variant={rule.channel === 'WhatsApp' ? 'success' : 'info'} size="sm">
                    {rule.channel}
                  </Badge>
                  <Badge variant={rule.enabled ? 'success' : 'neutral'} size="sm" dot>
                    {rule.enabled ? 'Actif' : 'Désactivé'}
                  </Badge>
                </div>

                <p className="text-xs text-on-surface-variant">
                  <strong>Déclencheur automatique :</strong> {rule.trigger}
                </p>

                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 text-xs font-mono text-on-surface leading-relaxed">
                  "{rule.template}"
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-start">
                <Button
                  variant={rule.enabled ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => toggleRule(rule.id)}
                >
                  {rule.enabled ? 'Désactiver' : 'Activer'}
                </Button>
                <Button variant="ghost" size="sm" icon="edit" title="Modifier le modèle">
                  Modifier
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
