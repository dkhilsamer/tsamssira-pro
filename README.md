# 🏡 Tsamssira Pro - Plateforme Immobilière Premium

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8+-orange.svg)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Plateforme moderne de mise en relation entre propriétaires et locataires/acheteurs en Tunisie. Interface responsive, système de messagerie temps réel, et emails automatiques.

---

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** - Bcrypt, sessions, réinitialisation par email
- 💬 **Messagerie en temps réel** - Communication directe propriétaire/visiteur
- 📸 **Upload d'images multiples** - Support local et Cloudinary
- 🚀 **Boost de propriétés** - Mise en avant payante (30 jours)
- 🔍 **Recherche avancée** - Filtres dynamiques et tri intelligent
- 📧 **Emails automatiques** - Bienvenue, notifications, réinitialisation
- 📊 **Dashboard propriétaire** - Statistiques, gestion des annonces
- 📱 **PWA Ready** - Installable sur iPhone/Android
- 🎨 **Design Premium** - Glassmorphism, animations fluides
- 🌍 **100% Responsive** - PC, tablette, mobile
- 🌓 **Dark Mode** - Thème sombre avec persistance
- 🗺️ **Carte interactive** - Visualisation géographique des biens
- 🔔 **Notifications en temps réel** - Alertes pour messages et demandes

---

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** - Framework UI moderne
- **Vite** - Build tool ultra-rapide
- **React Router v6** - Navigation SPA
- **Axios** - Client HTTP
- **Lucide React** - Icônes modernes
- **Leaflet** - Cartes interactives
- **Service Worker** - PWA support
- **Capacitor** - Application mobile native

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework web minimaliste
- **MySQL 8+** - Base de données relationnelle
- **Bcrypt.js** - Hashage sécurisé des mots de passe
- **Nodemailer** - Envoi d'emails SMTP
- **Express Session** - Gestion des sessions
- **Multer** - Upload de fichiers
- **Sharp** - Traitement d'images et watermarking

### Services Tiers
- **Gmail SMTP** - Emails transactionnels
- **Cloudinary** (optionnel) - Stockage d'images
- **PlanetScale/Aiven** - Base de données cloud (production)

---

## 📦 Installation Locale

### Prérequis
```bash
Node.js >= 18.0.0
MySQL >= 8.0
npm ou yarn
```

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/dkhilsamer/tsamssira-pro.git
cd tsamssira_pro
```

### 2️⃣ Configuration Backend
```bash
cd backend
npm install
```

Créez un fichier `.env` dans `backend/` :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tsamssira_db
PORT=3000
SESSION_SECRET=votre_secret_securise_ici

# Configuration Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application
FRONTEND_URL=http://localhost:5173
```

Lancez le serveur :
```bash
npm start
```

### 3️⃣ Configuration Frontend
```bash
cd ../frontend-react
npm install
```

Créez un fichier `.env` dans `frontend-react/` :
```env
VITE_BACKEND_URL=http://localhost:3000
```

Lancez en mode développement :
```bash
npm run dev
```

🎉 **L'application est accessible sur** : `http://localhost:5173`

---

## 🚀 Déploiement Production

### 🗄️ ÉTAPE 1 : Base de données PostgreSQL sur Render

1. Créer un compte sur [render.com](https://render.com)
2. Nouveau **PostgreSQL** database :
   - **Name** : `tsamssira-db`
   - **Region** : `Frankfurt (EU Central)`
   - **Plan** : **Free**
3. Dans le **Shell**, exécutez le contenu de `backend/init-db.sql`
4. Copiez **Internal Database URL** pour l'étape suivante

### 🖥️ ÉTAPE 2 : Backend sur Render

1. Nouveau **Web Service** depuis GitHub
2. Configurez :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : **Free**

3. Variables d'environnement :
   ```
   DATABASE_URL=[URL de l'étape 1]
   SESSION_SECRET=tsamssira_production_secret_2026
   EMAIL_SERVICE=gmail
   EMAIL_USER=tsamsssirapro@gmail.com
   EMAIL_PASSWORD=[votre mot de passe app]
   FRONTEND_URL=https://tsamssira.pages.dev
   NODE_ENV=production
   ```

### 🎨 ÉTAPE 3 : Frontend sur Cloudflare Pages

1. Compte sur [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create application** → **Pages**
3. Connectez GitHub et sélectionnez le repository
4. Configurez :
   - **Framework** : `Vite`
   - **Build command** : `npm run build`
   - **Output directory** : `dist`
   - **Root directory** : `frontend-react`
   - **Variable** : `VITE_BACKEND_URL=[URL du backend Render]`

### 🔥 ÉTAPE 4 : Keepalive (UptimeRobot)

1. Compte sur [uptimerobot.com](https://uptimerobot.com)
2. **Add New Monitor** :
   - **Type** : `HTTP(s)`
   - **URL** : `https://[votre-backend].onrender.com/api/health`
   - **Interval** : `5 minutes`

---

## 📧 Configuration Email

### Gmail (Recommandé)

1. Activez la **vérification en 2 étapes** sur votre compte Google
2. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Créez un **mot de passe d'application** nommé "TsamssiraPro"
4. Copiez le mot de passe de 16 caractères
5. Ajoutez-le dans votre `.env` :
   ```env
   EMAIL_PASSWORD=votre_mot_de_passe_16_caracteres
   ```

---

## 📱 PWA Installation

L'application peut être installée sur mobile :

**iPhone/iPad** :
1. Ouvrez dans Safari
2. Cliquez sur l'icône de partage
3. "Ajouter à l'écran d'accueil"

**Android** :
1. Ouvrez dans Chrome
2. Menu → "Installer l'application"

---

## 📱 Application Mobile Native (Capacitor)

### Générer les projets natifs

```bash
cd frontend-react
npm run build
npx cap sync
```

### Lancer sur émulateur/appareil

**Android** :
```bash
npx cap open android
```

**iOS** :
```bash
npx cap open ios
```

---

## 🗄️ Structure du Projet

```
tsamssira_pro/
├── backend/
│   ├── src/
│   │   ├── models/          # Modèles de données
│   │   ├── routes/          # Routes API
│   │   ├── middleware/      # Middlewares (upload, auth)
│   │   ├── services/        # Services (email, etc.)
│   │   ├── db.js            # Configuration MySQL
│   │   └── index.js         # Point d'entrée
│   ├── uploads/             # Images locales
│   ├── .env                 # Variables d'environnement
│   └── package.json
│
├── frontend-react/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # API client (axios)
│   │   ├── context/         # React Context (Theme)
│   │   ├── index.css        # Styles globaux
│   │   └── App.jsx          # Composant racine
│   ├── public/
│   │   ├── manifest.json    # Configuration PWA
│   │   └── sw.js            # Service Worker
│   ├── android/             # Projet Android natif
│   ├── ios/                 # Projet iOS natif
│   ├── .env                 # Variables d'environnement
│   └── package.json
│
└── README.md
```

---

## 🎨 Fonctionnalités Premium Implémentées

### 🌓 Modern Dark Mode
- Implémenté avec React Context (`ThemeContext.jsx`)
- Persistance dans `localStorage`
- Toggle animé Sun/Moon dans la Navbar

### 📍 Carte Interactive (Leaflet)
- Vue dynamique "Carte" sur la HomePage
- Marqueurs cliquables avec popups
- Navigation vers les détails des biens

### 🔔 Notifications Temps Réel
- Système dédié pour messages et demandes de location
- Table `notifications` avec API endpoints
- Badge animé dans la Navbar avec dropdown

### 📊 Analytics & Watermarking
- Statistiques de vues par propriété
- Watermark automatique sur les images (Sharp)
- Dashboard propriétaire enrichi

### 🏦 Contact Direct Propriétaire
- Affichage du username, téléphone et email sur chaque annonce
- Facilite la communication directe

---

## 🔒 Sécurité

- ✅ Mots de passe hashés avec **bcrypt** (10 rounds)
- ✅ Sessions sécurisées avec `httpOnly` cookies
- ✅ Protection **CORS** configurée
- ✅ Validation des entrées utilisateur
- ✅ Tokens de réinitialisation avec **expiration** (1h)
- ✅ Upload de fichiers sécurisé (Multer)

---

## 🚀 Vision & Roadmap Future

### 🏗️ Phase 1 : Intelligence & Automatisation
- **🤖 Assistant IA Rédacteur** : Génération automatique de descriptions captivantes
- **📸 Smart Image Optimizer** : Détection automatique et floutage de visages/plaques
- **💬 Chatbot de Pré-qualification** : Réponses automatiques aux questions fréquentes

### 🌍 Phase 2 : Expérience Immersive
- **📽️ Visite Virtuelle 360°** : Photos panoramiques interactives
- **🗺️ POI (Points d'Intérêt)** : Commodités proches sur la carte
- **🌍 Support Multilingue** : Arabe, Français, Anglais

### 🏦 Phase 3 : Écosystème de Paiement
- **💳 Intégration Konnect / ClickToPay** : Paiement direct des boosts
- **📄 Gestion des Contrats** : Génération de PDF pré-remplis
- **⭐ Système de Notation** : Avis vérifiés sur les propriétaires

### 📱 Phase 4 : Expansion Mobile Native
- ✅ **Application Mobile Native** : Capacitor intégré, projets Android/iOS générés
- **🔔 Notifications Push** : Alertes instantanées pour nouvelles annonces
- **📲 Publication sur les Stores** : App Store & Play Store

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une **issue** ou un **pull request**.

---

## 📄 Licence

MIT © 2026 Tsamssira Pro

---

## 👨‍💻 Auteur

**Développé avec ❤️ pour l'immobilier tunisien**

- 📧 Email : tsamsssirapro@gmail.com
- 🌐 Site : [tsamssirapro.online](https://tsamssirapro.online)
- 💻 GitHub : [github.com/dkhilsamer/tsamssira-pro](https://github.com/dkhilsamer/tsamssira-pro)

---

## 🔗 URLs Production

| Service | URL |
|---------|-----|
| **Site web** | https://tsamssirapro.online |
| **API Backend** | https://tsamssira-backend.onrender.com |
| **API Health** | https://tsamssira-backend.onrender.com/api/health |
| **Code GitHub** | https://github.com/dkhilsamer/tsamssira-pro |

---

## 🙏 Remerciements

- [React](https://react.dev)
- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
- [MySQL](https://mysql.com)
- [Vite](https://vitejs.dev)
- [Leaflet](https://leafletjs.com)
- [Capacitor](https://capacitorjs.com)
