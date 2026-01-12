# Guide de Configuration et Installation

## 🚀 Démarrage rapide

### Prérequis minimaux
- Node.js 16.x ou supérieur
- npm ou yarn
- Git

### Installation en 5 minutes

```bash
# 1. Cloner le projet
git clone <repository-url>
cd systme_auth_with_express

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env

# 4. Initialiser la base de données
npm run db:push

# 5. Lancer le serveur
npm run dev
```

**Résultat:** API disponible à `http://localhost:3000`

---

## 📋 Configuration détaillée

### Variables d'environnement (.env)

#### Serveur
```env
# Port d'écoute
PORT=3000

# Environnement
NODE_ENV=development  # development, production, test
```

#### Base de données
```env
# SQLite (par défaut)
DATABASE_URL="file:./prisma/dev.db"

# PostgreSQL (optionnel)
# DATABASE_URL="postgresql://user:password@localhost:5432/authdb"

# MySQL (optionnel)
# DATABASE_URL="mysql://user:password@localhost:3306/authdb"
```

#### JWT
```env
# Secret pour signer les JWT
JWT_SECRET=your_very_secret_key_min_32_chars_long_here

# Durée d'expiration du token d'accès
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

#### Email (Nodemailer/SMTP)
```env
# Gmail SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_specific_password  # Pas votre mot de passe Gmail!
MAIL_FROM="Your App Name"
MAIL_SECURE=false  # true pour port 465

# Autre fournisseur SMTP
MAIL_HOST=smtp.company.com
MAIL_PORT=587
MAIL_USER=username
MAIL_PASSWORD=password
```

**⚠️ Générer un mot de passe spécifique à l'app Gmail:**
1. Aller à https://myaccount.google.com/security
2. Activer "Authentification à 2 facteurs"
3. Créer un "mot de passe d'application" pour Mail/Windows
4. Utiliser ce mot de passe dans MAIL_PASSWORD

#### SendGrid (optionnel)
```env
# Alternative à Nodemailer
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@app.com
```

#### OAuth Google
```env
# Créer une app sur https://console.cloud.google.com

# Client ID et Secret
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Redirect URI (doit être enregistrée dans Google Cloud)
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**Obtenir les credentials Google:**
1. Aller à [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer l'API "Google+ API"
4. Créer des "OAuth 2.0 Client Credentials" (Web application)
5. Ajouter `http://localhost:3000/api/auth/google/callback` dans les origins autorisés
6. Copier Client ID et Secret

#### Application (optionnel)
```env
# URL de base de l'application
APP_URL=http://localhost:3000
APP_NAME=My Auth System

# Frontend URL (pour les redirects après OAuth)
FRONTEND_URL=http://localhost:3000
```

#### 2FA (optionnel)
```env
# Paramètres 2FA
2FA_ISSUER=Your App Name
2FA_BACKUP_CODES_COUNT=5
```

#### Rate Limiting (optionnel)
```env
# Limite de requêtes
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Par endpoint
RATE_LIMIT_AUTH_MAX=5        # 5 tentatives de login
RATE_LIMIT_AUTH_WINDOW=900000 # en 15 minutes
```

#### Logging (optionnel)
```env
# Niveau de log
LOG_LEVEL=info  # trace, debug, info, warn, error, fatal

# Format de sortie
LOG_FORMAT=pretty  # pretty, json
```

---

## 🗄️ Commandes de base de données

### Prisma

```bash
# Générer le client Prisma
npm run db:generate

# Synchroniser le schéma avec la BD
npm run db:push

# Créer une nouvelle migration
npm run db:migrate

# Ouvrir l'interface Prisma Studio
npm run db:studio

# Afficher l'état des migrations
npx prisma migrate status

# Revenir à une migration précédente
npx prisma migrate resolve --rolled-back <migration_name>

# Réinitialiser la BD (développement seulement)
npx prisma migrate reset
```

### Reset de la base de données

```bash
# Attention: supprime toutes les données!
npx prisma migrate reset

# Ou manuellement
rm prisma/dev.db
npm run db:push
```

---

## 🔧 Configuration Prisma (schema.prisma)

### Changer la base de données

#### SQLite (défaut)
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

#### PostgreSQL
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### MySQL
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

Puis mettez à jour `DATABASE_URL` dans `.env`

---

## 📧 Configuration Email

### Gmail (recommandé pour dev)

1. **Activer 2FA sur Gmail:**
   - Aller à https://myaccount.google.com/security
   - Cliquer sur "Authentification à 2 facteurs"
   - Suivre les étapes

2. **Créer un mot de passe d'application:**
   - Aller à https://myaccount.google.com/apppasswords
   - Sélectionner Mail et Windows
   - Copier le mot de passe généré

3. **Configurer .env:**
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Le mot de passe généré
MAIL_FROM="Your App"
MAIL_SECURE=false
```

### Mailtrap (pour tester)

```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_inbox_id
MAIL_PASSWORD=your_mailtrap_token
MAIL_FROM="Test App"
MAIL_SECURE=false
```

### SendGrid

```env
# Alternative avec SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@app.com
```

---

## 🔒 Sécurité en production

### Avant de déployer

- [ ] Changer `JWT_SECRET` par une clé sécurisée (32+ caractères)
- [ ] Définir `NODE_ENV=production`
- [ ] Utiliser une vraie BD (PostgreSQL recommandé)
- [ ] Activer HTTPS
- [ ] Configurer les variables d'environnement sécurisées
- [ ] Augmenter les limites de rate limit si nécessaire
- [ ] Configurer CORS pour votre domaine
- [ ] Ajouter des logs structurés
- [ ] Mettre en place un monitoring
- [ ] Faire des backups réguliers de la BD

### Générer un JWT_SECRET sécurisé

```bash
# Utiliser OpenSSL
openssl rand -base64 32

# Ou Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Variables d'environnement en production

```bash
# Avec pm2
pm2 start src/index.js --name "auth-api" \
  --env "NODE_ENV=production" \
  --env "PORT=3000"

# Avec Docker
docker run -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -p 3000:3000 auth-api
```

---

## 🐳 Configuration Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci --only=production
RUN npm run db:generate

# Copier le code source
COPY src ./src

# Exposer le port
EXPOSE 3000

# Lancer l'application
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/authdb
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    depends_on:
      - postgres
    networks:
      - auth-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: authdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - auth-network

volumes:
  postgres_data:

networks:
  auth-network:
```

**Lancer avec Docker:**
```bash
docker-compose up -d
```

---

## ☁️ Déploiement

### Vercel

```bash
# vercel.json
{
  "version": 2,
  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.js" }],
  "env": {
    "NODE_ENV": "production"
  }
}
```

```bash
npm i -g vercel
vercel
```

### Railway

```bash
# Connecter le repo GitHub
# Railway détecte automatiquement l'app Node.js
# Configurer les variables d'environnement dans le dashboard
```

### Heroku

```bash
# Créer l'app
heroku create your-auth-app

# Configurer les variables
heroku config:set JWT_SECRET="..."
heroku config:set DATABASE_URL="..."

# Déployer
git push heroku main
```

### AWS EC2

```bash
# Sur l'instance EC2
sudo apt update
sudo apt install nodejs npm postgresql

# Cloner et configurer
git clone <repo>
cd systme_auth_with_express
npm install
npm run db:push

# Lancer avec PM2
npm i -g pm2
pm2 start src/index.js --name "auth-api"
pm2 startup
pm2 save
```

---

## 📊 Variables d'environnement par environnement

### Développement (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=dev_secret_key_not_secure
LOG_LEVEL=debug
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=test_inbox
```

### Test (.env.test)
```env
NODE_ENV=test
PORT=3001
DATABASE_URL="file:./prisma/test.db"
JWT_SECRET=test_secret_key
LOG_LEVEL=error
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:pass@prod-db:5432/authdb"
JWT_SECRET=<secure-random-key>
LOG_LEVEL=warn
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=<production-email>
MAIL_PASSWORD=<app-password>
```

---

## ✅ Checklist de configuration

- [ ] Node.js installé (v16+)
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` créé et configuré
- [ ] Base de données initialisée (`npm run db:push`)
- [ ] Client Prisma généré (`npm run db:generate`)
- [ ] Variables d'email configurées (Gmail, SendGrid, ou Mailtrap)
- [ ] OAuth Google configuré (optionnel)
- [ ] Serveur lancé et accessible à http://localhost:3000
- [ ] Routes testées avec cURL ou Postman

---

**Dernière mise à jour:** 12 janvier 2026
