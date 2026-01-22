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

---

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** - Framework UI moderne
- **Vite** - Build tool ultra-rapide
- **React Router v6** - Navigation SPA
- **Axios** - Client HTTP
- **Lucide React** - Icônes modernes
- **Service Worker** - PWA support

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework web minimaliste
- **MySQL 8+** - Base de données relationnelle
- **Bcrypt.js** - Hashage sécurisé des mots de passe
- **Nodemailer** - Envoi d'emails SMTP
- **Express Session** - Gestion des sessions
- **Multer** - Upload de fichiers

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
git clone https://github.com/votre-username/tsamssira_pro.git
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

### Backend (Railway / Render)

**Railway** (Recommandé) :
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

**Variables d'environnement** à configurer :
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `SESSION_SECRET`
- `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`
- `FRONTEND_URL` (URL de votre frontend déployé)

### Frontend (Vercel / Netlify)

**Build de production** :
```bash
cd frontend-react
npm run build
```

**Déploiement Vercel** :
```bash
npm i -g vercel
vercel --prod
```

**Déploiement Netlify** :
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

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
│   │   ├── index.css        # Styles globaux
│   │   └── App.jsx          # Composant racine
│   ├── public/
│   │   ├── manifest.json    # Configuration PWA
│   │   └── sw.js            # Service Worker
│   ├── .env                 # Variables d'environnement
│   └── package.json
│
└── README.md
```

---

## 🔒 Sécurité

- ✅ Mots de passe hashés avec **bcrypt** (10 rounds)
- ✅ Sessions sécurisées avec `httpOnly` cookies
- ✅ Protection **CORS** configurée
- ✅ Validation des entrées utilisateur
- ✅ Tokens de réinitialisation avec **expiration** (1h)
- ✅ Upload de fichiers sécurisé (Multer)

---

## 🎯 Roadmap

- [ ] Système de favoris
- [ ] Notifications push en temps réel
- [ ] Intégration paiement Konnect/Flouci
- [ ] Chat vidéo pour visites virtuelles
- [ ] Carte interactive (Google Maps)
- [ ] Comparateur de propriétés
- [ ] Export PDF des annonces

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
- 🌐 Site : [tsamssira-pro.onrender.com](https://tsamssira-pro.onrender.com)

---

## 🙏 Remerciements

- [React](https://react.dev)
- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
- [MySQL](https://mysql.com)
- [Vite](https://vitejs.dev)
