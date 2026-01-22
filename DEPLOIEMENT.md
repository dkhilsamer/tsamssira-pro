# 🚀 Guide de déploiement - Phase 1 (Gratuit)

Ce guide vous accompagne pour déployer **Tsamssira Pro** en production gratuitement.

---

## 📋 Prérequis

- ✅ Compte GitHub (déjà fait)
- ✅ Code poussé sur GitHub (fait)
- ⏳ Compte Render (à créer)
- ⏳ Compte Cloudflare (à créer)

**Durée totale** : ~20 minutes

---

## 🗄️ ÉTAPE 1 : Déployer la base de données PostgreSQL sur Render

### 1.1 Créer un compte Render
1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Connectez-vous avec **GitHub**
4. Autorisez l'accès à vos repositories

### 1.2 Créer une base de données PostgreSQL
1. Sur le Dashboard Render, cliquez sur **"New +"** (en haut à droite)
2. Sélectionnez **"PostgreSQL"**
3. Configurez :
   - **Name** : `tsamssira-db`
   - **Database** : `tsamssira_db` (ou laissez par défaut)
   - **User** : (auto-généré)
   - **Region** : `Frankfurt (EU Central)` (le plus proche de la Tunisie)
   - **PostgreSQL Version** : Dernière version
   - **Plan** : **Free** ✅
4. Cliquez sur **"Create Database"**
5. ⏳ Attendez 1-2 minutes que la base se crée

### 1.3 Initialiser les tables
1. Une fois créée, cliquez sur votre base de données
2. Allez dans l'onglet **"Shell"** (en haut)
3. Ouvrez le fichier `backend/init-db.sql` de votre projet
4. **Copiez tout le contenu** du fichier
5. **Collez** dans le Shell Render
6. Appuyez sur **Entrée**
7. ✅ Vous devriez voir : `CREATE TABLE` pour chaque table

### 1.4 Récupérer l'URL de connexion
1. Restez sur la page de votre base de données
2. Trouvez la section **"Connections"**
3. Copiez **"Internal Database URL"** (commence par `postgresql://`)
4. 📋 Gardez-la de côté (vous en aurez besoin à l'étape 2)

---

## 🖥️ ÉTAPE 2 : Déployer le Backend (API) sur Render

### 2.1 Créer un Web Service
1. Retournez au Dashboard Render
2. Cliquez sur **"New +"** → **"Web Service"**
3. Cliquez sur **"Build and deploy from a Git repository"** → **Next**
4. Trouvez et sélectionnez : **`dkhilsamer/tsamssira-pro`**
5. Cliquez sur **"Connect"**

### 2.2 Configuration du service
Remplissez les champs :

- **Name** : `tsamssira-backend`
- **Region** : `Frankfurt (EU Central)`
- **Branch** : `main`
- **Root Directory** : `backend`
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Plan** : **Free** ✅

### 2.3 Ajouter les variables d'environnement

Faites défiler jusqu'à **"Environment Variables"** et cliquez sur **"Add Environment Variable"**.

Ajoutez **UNE PAR UNE** :

| Key | Value |
|-----|-------|
| `DATABASE_URL` | [Collez l'Internal Database URL de l'étape 1.4] |
| `SESSION_SECRET` | `tsamssira_production_secret_2026_ultra_secure` |
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `tsamsssirapro@gmail.com` |
| `EMAIL_PASSWORD` | `mpassxgjwbnawdbcibnbm` |
| `FRONTEND_URL` | `https://tsamssira.pages.dev` |
| `NODE_ENV` | `production` |

### 2.4 Déployer
1. Cliquez sur **"Create Web Service"** (en bas)
2. ⏳ Render va :
   - Cloner votre code
   - Installer les dépendances
   - Démarrer le serveur
3. **Attendez 3-5 minutes** (suivez les logs en temps réel)
4. ✅ Quand vous voyez **"Your service is live"**, c'est prêt !

### 2.5 Tester le backend
1. Sur la page de votre service, trouvez l'URL (ex: `https://tsamssira-backend.onrender.com`)
2. Ouvrez dans un nouvel onglet : `https://votre-url.onrender.com/api/health`
3. ✅ Vous devriez voir : `{"status":"ok","timestamp":"..."}`

📋 **Copiez cette URL**, vous en aurez besoin pour le frontend !

---

## 🎨 ÉTAPE 3 : Déployer le Frontend sur Cloudflare Pages

### 3.1 Créer un compte Cloudflare
1. Allez sur [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Créez un compte avec votre email
3. Vérifiez votre email
4. Connectez-vous au Dashboard

### 3.2 Créer un projet Pages
1. Dans le menu de gauche, cliquez sur **"Workers & Pages"**
2. Cliquez sur **"Create application"**
3. Sélectionnez l'onglet **"Pages"**
4. Cliquez sur **"Connect to Git"**

### 3.3 Autoriser GitHub
1. Cliquez sur **"GitHub"**
2. Autorisez Cloudflare à accéder à vos repos
3. Sélectionnez **"Only select repositories"**
4. Choisissez **`dkhilsamer/tsamssira-pro`**
5. Cliquez sur **"Install & Authorize"**

### 3.4 Configurer le build
1. Sélectionnez votre repository : **`tsamssira-pro`**
2. Cliquez sur **"Begin setup"**
3. Configurez :

   - **Project name** : `tsamssira` (deviendra : tsamssira.pages.dev)
   - **Production branch** : `main`
   - **Framework preset** : `Vite`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `frontend-react`

### 3.5 Ajouter la variable d'environnement
1. Faites défiler jusqu'à **"Environment variables (advanced)"**
2. Cliquez sur **"Add variable"**
3. Ajoutez :
   - **Variable name** : `VITE_BACKEND_URL`
   - **Value** : `https://tsamssira-backend.onrender.com` (votre URL du backend)

### 3.6 Déployer
1. Cliquez sur **"Save and Deploy"**
2. ⏳ Cloudflare va :
   - Cloner votre code
   - Installer les dépendances
   - Build React (npm run build)
   - Déployer sur le CDN mondial
3. **Attendez 3-5 minutes**
4. ✅ Quand vous voyez **"Success!"**, c'est en ligne !

### 3.7 Accéder à votre site
1. Cloudflare vous donnera l'URL : **`https://tsamssira.pages.dev`**
2. Cliquez dessus pour visiter votre site ! 🎉

---

## 🔥 ÉTAPE 4 : Garder le backend actif (UptimeRobot)

Pour éviter que le serveur s'endorme après 15 minutes :

### 4.1 Créer un compte UptimeRobot
1. Allez sur [uptimerobot.com](https://uptimerobot.com)
2. Cliquez sur **"Sign Up Free"**
3. Créez un compte
4. Confirmez votre email

### 4.2 Créer un moniteur
1. Cliquez sur **"+ Add New Monitor"**
2. Configurez :
   - **Monitor Type** : `HTTP(s)`
   - **Friendly Name** : `Tsamssira Backend Keepalive`
   - **URL** : `https://tsamssira-backend.onrender.com/api/health`
   - **Monitoring Interval** : `5 minutes`
3. Cliquez sur **"Create Monitor"**

✅ **Votre backend restera actif 24/7 !**

---

## 🎯 ÉTAPE 5 : Tester votre application

### Checklist de vérification :

- [ ] ✅ Ouvrir `https://tsamssira.pages.dev`
- [ ] ✅ S'inscrire avec un nouveau compte
- [ ] ✅ Vérifier la réception de l'email de bienvenue
- [ ] ✅ Se connecter avec les identifiants
- [ ] ✅ Publier une annonce de test (avec images)
- [ ] ✅ Tester la recherche et les filtres
- [ ] ✅ Envoyer un message de test
- [ ] ✅ Vérifier le dashboard

---

## 🔗 URLs finales

| Service | URL |
|---------|-----|
| **Site web** | https://tsamssira.pages.dev |
| **API Backend** | https://tsamssira-backend.onrender.com |
| **API Health** | https://tsamssira-backend.onrender.com/api/health |
| **Code GitHub** | https://github.com/dkhilsamer/tsamssira-pro |

---

## 🎊 Félicitations !

Votre plateforme immobilière est **EN LIGNE** et **100% GRATUITE** !

### Prochaines étapes (optionnelles) :

1. **Partager sur LinkedIn** avec le lien
2. **Tester avec de vrais utilisateurs**
3. **Acheter un domaine** quand vous êtes prêt (tsamssira.com)
4. **Passer à Render Starter** si vous avez beaucoup de trafic

---

## ⚠️ Notes importantes

- **Premier chargement** : Peut prendre 30s (démarrage à froid Render Free)
- **Après UptimeRobot** : Temps de réponse < 1s
- **Stockage images** : Local (limité), migrer vers Cloudinary si besoin
- **Base de données** : 1GB gratuit = ~10,000 annonces

---

## 🆘 Besoin d'aide ?

Si vous rencontrez un problème :
1. Vérifiez les logs Render (onglet "Logs")
2. Vérifiez les logs Cloudflare (onglet "Deployments")
3. Testez l'API health : `/api/health`

---

**Développé avec ❤️ pour l'immobilier tunisien**
