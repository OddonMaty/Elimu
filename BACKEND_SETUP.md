# Configuration du Backend Supabase pour Elimu RDC

Ce document vous guide pas à pas pour configurer votre propre projet Supabase, appliquer les schémas de base de données (migrations) et connecter l'application React.

## Étape 1 : Créer le projet Supabase

1. Rendez-vous sur [Supabase (supabase.com)](https://supabase.com) et créez un compte ou connectez-vous.
2. Cliquez sur **New Project** (Nouveau projet).
3. Choisissez une organisation (ou créez-en une), donnez un nom à votre projet (ex: `elimu-backend`), définissez un mot de passe sécurisé pour la base de données, et choisissez la région la plus proche de vos utilisateurs (ex: `Frankfurt (eu-central-1)` ou `Cape Town`).
4. Cliquez sur **Create new project** et attendez quelques minutes que la base de données soit provisionnée.

## Étape 2 : Récupérer les clés d'API

Une fois le projet prêt :
1. Dans le menu de gauche, allez dans **Project Settings** (l'icône d'engrenage en bas).
2. Cliquez sur **API**.
3. Copiez l'URL du projet (**Project URL**).
4. Copiez la clé publique anonyme (**Project API keys > anon / public**).

## Étape 3 : Configurer le fichier `.env`

Dans le dossier racine de l'application Elimu (`/home/maggiepatriciamatyabo/Elimu (3)`), créez un fichier `.env` s'il n'existe pas déjà, et ajoutez-y ces deux lignes avec les valeurs récupérées à l'étape 2 :

```env
VITE_SUPABASE_URL=votre_project_url_ici
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

*(Assurez-vous que le fichier `.env` est bien ignoré par Git en vérifiant `.gitignore`)*

## Étape 4 : Exécuter les Migrations (Schéma & Sécurité)

Dans l'interface Supabase :
1. Allez dans l'onglet **SQL Editor** dans le menu de gauche.
2. Cliquez sur **New Query**.
3. Ouvrez le fichier `supabase/migrations/01_schema.sql` (qui se trouve dans votre code source), copiez son contenu, collez-le dans le SQL Editor, puis cliquez sur **Run** (Exécuter). Cela va créer toutes les tables et insérer les plans tarifaires par défaut.
4. Créez une nouvelle requête (New Query), copiez-collez le contenu de `supabase/migrations/02_rls_policies.sql`, et exécutez-la. Cela va activer la Row Level Security (RLS) pour sécuriser et isoler les données par école.

## Étape 5 : Authentification & Création de Compte

1. Allez dans l'onglet **Authentication** > **Providers** dans Supabase.
2. Assurez-vous que le fournisseur **Email** est activé.
3. **IMPORTANT - Paramètre "Confirm email"** :
   * **Option 1 (Recommandée pour l'instant)** : Désactivez "Confirm email". Cela permet à l'application de connecter immédiatement l'utilisateur après l'inscription (signUp) et de déclencher la création de l'école dans la foulée sans erreur.
   * **Option 2** : Si vous laissez "Confirm email" activé, le processus d'inscription (`signUp`) ne créera pas de session immédiate. L'appel pour créer l'école échouera donc en arrière-plan. Dans ce cas, vous devrez adapter le code de `SchoolOnboardingPage.tsx` pour afficher un message "Vérifiez votre email" et rediriger la création de l'école *après* que l'utilisateur ait cliqué sur le lien reçu par email.

## Étape 6 : Configuration des Emails (Resend) - Edge Function

Pour que l'envoi automatique des codes d'invitation par email fonctionne, vous devez configurer le service **Resend** et l'associer à l'Edge Function Supabase `send-invitation-email`.

1. **Créer un compte Resend et vérifier un domaine** :
   - Allez sur [resend.com](https://resend.com) et créez un compte gratuit.
   - Par défaut, l'Edge Function utilise l'adresse de test `onboarding@resend.dev` qui vous permet d'envoyer des emails à l'adresse avec laquelle vous vous êtes inscrit sur Resend.
   - **Pour la production (envoyer à n'importe qui)** : Allez dans la section **Domains** de Resend, ajoutez votre nom de domaine (ex: `elimu.cd`), et configurez les enregistrements DNS fournis.
   - Une fois le domaine vérifié, n'oubliez pas de modifier le code de `supabase/functions/send-invitation-email/index.ts` pour remplacer `onboarding@resend.dev` par votre adresse vérifiée (ex: `no-reply@elimu.cd`), puis redéployez la fonction.
   - Créez une API Key depuis votre tableau de bord Resend.

2. **Configurer le secret dans Supabase** :
   Assurez-vous d'avoir lié votre projet local au projet distant :
   ```bash
   npx supabase link --project-ref VOTRE_PROJECT_REF
   ```
   Ensuite, injectez la clé API de Resend dans les secrets de votre projet Supabase :
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_VOTRE_CLE_API
   ```

3. **Déployer la fonction** :
   Déployez la fonction `send-invitation-email` vers votre projet Supabase :
   ```bash
   npx supabase functions deploy send-invitation-email
   ```
   Si vous testez en local avec `npx supabase start`, la fonction est automatiquement servie et lira les secrets depuis un fichier `.env.local` que vous pouvez créer à la racine du dossier supabase (`RESEND_API_KEY=...`).

## Étape 7 : Redémarrer l'application

Si votre serveur de développement Vite tourne déjà, arrêtez-le (Ctrl+C) et redémarrez-le avec :
```bash
npm run dev
```

C'est prêt ! Vous pouvez maintenant inscrire une nouvelle école via la page `/onboarding`. Un compte réel sera créé dans Supabase, l'école sera enregistrée, et vous pourrez vous connecter.
