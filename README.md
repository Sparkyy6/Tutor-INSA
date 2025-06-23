https://github.com/Sparkyy6/Tutor-INSA.git

# 🎓 Tutor'INSA

Tutor'INSA est une plateforme web destinée aux étudiants de l'INSA Centre-Val de Loire pour demander ou proposer du tutorat académique. Elle propose une authentification sécurisée, une messagerie en temps réel, une gestion de calendrier avec export, et un contrôle avancé de la confidentialité.

## 🚀 Fonctionnalités

- 🔐 Authentification sécurisée via Supabase (aucun mot de passe en clair)
- 📬 Notifications en temps réel (navigateur/mobile)
- 📆 Système de calendrier avec export (iCal, etc.)
- 🔎 Recherche de tuteurs par matière, département ou année
- 🛡️ Respect de la vie privée et système de modération

---

## 🛠 Pile technologique

| Couche           | Technologie                            |
|------------------|----------------------------------------|
| Frontend         | React + TypeScript + TailwindCSS       |
| State/API        | Supabase (Auth, DB, Realtime)          |
| Build Tool       | Vite                                   |
| Styling          | Tailwind CSS                           |

# Structure des dossiers

## Dossier `src`

Ce dossier contient tout le code source de l'application front-end :

- **App.tsx** : Composant racine de l'application React.
- **main.tsx** : Point d'entrée principal qui monte l'application dans le DOM.
- **index.css** : Fichier principal de styles, utilise Tailwind CSS.
- **vite-env.d.ts** : Déclarations de types pour Vite.
- **components/** : Tous les composants React réutilisables (ex: formulaires, pages, listes, chat, etc.).
- **contexts/** : Contextes React pour la gestion globale de l'état (ex: authentification).
- **lib/** : Fonctions utilitaires et configuration (ex: initialisation Supabase).
- **routes/** : Définition des routes de l'application (si utilisé).
- **services/** : Fonctions pour interagir avec Supabase (authentification, requêtes, etc.).
- **types/** : Déclarations TypeScript pour les types utilisés dans l'application.

## Dossier `supabase`

Ce dossier contient la configuration et la gestion de la base de données Supabase :

- **migrations/** : Scripts SQL pour créer et modifier la structure de la base de données (tables, contraintes, policies de sécurité, etc.).
- **.temp/** : Fichiers temporaires générés par Supabase CLI (références de projet, version, etc.).

Les migrations définissent les tables principales :  
- `users` : Utilisateurs de la plateforme  
- `student` : Étudiants inscrits  
- `tutor` : Tuteurs inscrits  
- `matiere` : Matières disponibles  
- `session` : Sessions de tutorat  
- `conversation` et `message` : Messagerie interne

