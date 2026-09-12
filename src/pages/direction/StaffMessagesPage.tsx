import React, { useEffect, useState } from 'react';
import { messageService } from '../../services/api';
import { Message } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export interface StaffMessagesPageProps {}

export const StaffMessagesPage: React.FC<StaffMessagesPageProps> = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [recipient, setRecipient] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      if (currentUser.id) {
        const data = await messageService.getMessages(currentUser.id);
        setMessages(data);
      }
      setLoading(false);
    };
    fetch();
  }, [currentUser.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newBody || !recipient) return;
    setIsComposing(false);
    notify('success', 'Message Envoyé', 'Votre message a été transmis avec succès.');
    setNewSubject('');
    setNewBody('');
    setRecipient('');
  };

  if (loading) return <LoadingSpinner message="Chargement des messages..." />;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Messagerie Interne
          </h1>
          <p className="text-xs text-on-surface-variant">
            Communications entre le personnel, la direction et les parents
          </p>
        </div>
        <Button variant="accent" size="sm" icon="edit_square" onClick={() => setIsComposing(true)}>
          Nouveau Message
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Message list */}
        <div className="md:col-span-1 space-y-2">
          {messages.map(msg => (
            <button
              key={msg.id}
              type="button"
              onClick={() => setSelected(msg)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                selected?.id === msg.id
                  ? 'border-primary bg-primary-fixed/30'
                  : 'border-outline-variant bg-white hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-primary truncate">{msg.senderName}</span>
                {!msg.read && <Badge variant="primary" size="sm">Nouveau</Badge>}
              </div>
              <p className="font-semibold text-on-surface truncate">{msg.subject}</p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">{msg.timestamp}</p>
            </button>
          ))}
          {messages.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant text-xs">
              Aucun message reçu.
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="md:col-span-2">
          {selected ? (
            <Card noPadding className="p-5 h-full">
              <div className="border-b border-outline-variant pb-3 mb-4 space-y-1">
                <h3 className="font-extrabold text-base text-primary">{selected.subject}</h3>
                <p className="text-xs text-on-surface-variant">
                  De : <strong>{selected.senderName}</strong> ({selected.senderRole}) • Le {selected.timestamp}
                </p>
                <Badge variant="primary" size="sm">
                  {selected.senderRole}
                </Badge>
              </div>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {selected.body}
              </p>
              <div className="mt-6 pt-4 border-t border-outline-variant">
                <Button variant="outline" size="sm" icon="reply" onClick={() => {
                  setRecipient(selected.senderName);
                  setNewSubject(`Re: ${selected.subject}`);
                  setIsComposing(true);
                }}>
                  Répondre
                </Button>
              </div>
            </Card>
          ) : (
            <Card noPadding className="h-full flex items-center justify-center p-12">
              <div className="text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl opacity-30 block mb-2">mail</span>
                <p className="text-sm font-medium">Sélectionnez un message pour le lire</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <Modal
        isOpen={isComposing}
        onClose={() => setIsComposing(false)}
        title="Rédiger un Message"
        subtitle="Envoyer une communication interne ou aux parents"
      >
        <form onSubmit={handleSend} className="space-y-4">
          <Input
            label="Destinataire *"
            placeholder="Nom ou rôle"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            required
          />
          <Input
            label="Objet du message *"
            placeholder="ex: Réunion pédagogique"
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            required
          />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
              Message *
            </label>
            <textarea
              className="w-full h-28 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Rédigez votre message ici..."
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsComposing(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" icon="send">
              Envoyer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
