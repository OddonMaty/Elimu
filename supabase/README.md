# Elimu · Base de données et sécurité

## Environnements

| Environnement | Projet Supabase | Variables Vercel |
|---|---|---|
| Production | projet de production | environnement **Production** |
| Développement / préproduction | `elimu-dev` (`ouzwzsklgnqhyjcwaskn`) | environnement **Preview** (branches) |

Ne jamais mélanger les clés des deux projets. Les comptes de démonstration de `elimu-dev` sont décrits dans `seed_dev.sql` (mot de passe commun `ElimuDev#2026`). **Ne jamais exécuter `seed_dev.sql` en production.**

## Migrations

`01` à `11` : migrations d'origine. `12` à `14` : durcissement de la sécurité (cette branche).

| Fichier | Contenu |
|---|---|
| `12_security_rls_p0.sql` | Remplace **toutes** les politiques RLS : accès par rôle (direction, proviseur, secretariat, teacher, tresorerie, parent), isolation entre écoles, triggers anti-élévation de privilèges, fonctions durcies (`search_path`, droits), stockage |
| `13_application_payment_and_triggers.sql` | Déclaration de paiement des frais de dossier par le candidat, justification d'absence par le parent, matricule et code d'invitation générés par le serveur |
| `14_integrity_indexes.sql` | Index, unicités (matricule, facture, présence du jour, bulletin, classe), `updated_at`, effectif des classes automatique |

Ordre d'application en production : 12, 13, 14, **en même temps que le déploiement du code de cette branche** (le code ancien casserait : dépôt de dossier, paiement des frais, présences, bulletins).

## Ce que garantit le nouveau modèle de sécurité (testé sur `elimu-dev`)

- Un visiteur anonyme ne lit ni ne modifie aucune table ; il dépose un dossier, suit son dossier par identifiant (`get_application_status`) et déclare son paiement (`declare_application_payment`).
- Un parent ne voit que ses enfants (élève, notes, bulletins, factures, devoirs de la classe) et ses propres messages ; il ne peut ni changer son rôle, ni l'école, ni les factures ; il peut justifier l'absence de son enfant.
- Un enseignant voit élèves, présences, notes ; saisit présences, devoirs et notes ; ne voit ni factures, ni dossiers d'admission, ni invitations.
- Le secrétariat gère élèves, dossiers et factures ; la trésorerie gère factures et barème ; le proviseur gère classes et emplois du temps ; la direction gère tout dans son école.
- Aucun utilisateur ne voit ni ne modifie les données d'une autre école.

## Points connus, à traiter ensuite

- `schools` reste lisible en entier par le public (e-mail, téléphone, numéro de paiement) : prévoir une vue limitée à la vitrine.
- Les pièces d'admission ne sont pas isolées par école au niveau du stockage (le personnel d'une autre école pourrait les lire) : chemins `<école>/...` à prévoir.
- `medical_notes` est lisible par tout le personnel de l'école.
- Le compte `superadmin` n'a pas d'école : il ne voit que les données publiques tant qu'une politique dédiée n'existe pas.
- Le suivi des devoirs rendus (`homeworks.submission_status`) est partagé par tous les élèves de la classe : il faut une table `homework_submissions`.
- Paiement des factures côté parent et justification d'absence côté parent : écrans simulés (aucune écriture, aucun paiement réel). À brancher sur de vraies actions.
- En cas d'erreur Supabase, `src/services/api.ts` bascule en silence sur des données de démonstration : à retirer pour ne pas masquer les refus d'accès.
- Réglage Supabase Auth : la confirmation d'e-mail est déconseillée dans `BACKEND_SETUP.md` ; à activer avant l'ouverture au public.
