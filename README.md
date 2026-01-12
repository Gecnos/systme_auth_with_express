# Système d'Authentification avec Express 🔐

## 📋 Vue d'ensemble

Un système d'authentification robuste et complet basé sur **Express.js** avec support pour l'authentification locale, OAuth (Google), authentification à deux facteurs (2FA), gestion des emails et plus.

**Version:** 1.0.0  
**Type:** Module ES6  
**Base de données:** SQLite avec Prisma ORM

---

## ✨ Fonctionnalités principales

### 🔑 Authentification
- ✅ **Inscription (Register)** avec validation des données
- ✅ **Connexion (Login)** avec email/mot de passe
- ✅ **Rafraîchissement des tokens** (Refresh Token)
- ✅ **Déconnexion (Logout)** avec invalidation des tokens
- ✅ **Authentification OAuth Google**

### 🛡️ Sécurité
- ✅ **Hachage des mots de passe** avec bcrypt/argon2
- ✅ **JWT (JSON Web Tokens)** pour l'authentification
- ✅ **Rate limiting** pour prévenir les abus
- ✅ **CORS** pour la sécurité des origines croisées
- ✅ **Helmet** pour les en-têtes de sécurité HTTP
- ✅ **Blacklist de tokens** d'accès

### 📧 Gestion des emails
- ✅ **Vérification d'email** avec tokens uniques
- ✅ **Réinitialisation de mot de passe** par email
- ✅ **Support multi-fournisseur** (SendGrid, Nodemailer, Resend)
- ✅ **Templates d'email** personnalisables

### 🔐 Authentification à deux facteurs (2FA)
- ✅ **Configuration 2FA** TOTP (Time-based One-Time Password)
- ✅ **Codes QR** pour les applications d'authentification
- ✅ **Codes de secours** en cas de perte

### 👤 Gestion des utilisateurs
- ✅ **Profil utilisateur** (nom, prénom, email, etc.)
- ✅ **Mise à jour du profil**
- ✅ **Historique de connexion**
- ✅ **Comptes OAuth liés**

---

## 📁 Structure du projet

```
systme_auth_with_express/
│
├── src/                          # Code source
│   ├── index.js                 # Point d'entrée principal
│   ├── seed.js                  # Script de peuplement DB
│   │
│   ├── config/                  # Configuration
│   │   ├── mail.js             # Configuration des emails
│   │   └── passport.js         # Configuration Passport.js
│   │
│   ├── controllers/             # Contrôleurs (logique métier)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── oauth.controller.js
│   │   ├── 2fa.controller.js
│   │   ├── EmailController.js
│   │   └── VerificationController.js
│   │
│   ├── routes/                  # Routes API
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── OAuth&2fa.routes.js
│   │   ├── emailRoutes.js
│   │   └── password.routes.js
│   │
│   ├── services/                # Services (logique réutilisable)
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── Token.service.js
│   │   ├── Email.service.js
│   │   ├── 2fa.service.js
│   │   └── oauth.service.js
│   │
│   ├── middlewares/             # Middlewares Express
│   │   ├── auth.middleware.js   # Protection des routes
│   │   ├── error-handler.js     # Gestion des erreurs
│   │   ├── not-found.js         # Gestion 404
│   │   ├── Email.middleware.js
│   │   └── rate-limit.js        # Limitation de débit
│   │
│   ├── lib/                     # Utilitaires et helpers
│   │   ├── jwt.js               # Gestion JWT
│   │   ├── password.js          # Hachage des mots de passe
│   │   ├── prisma.js            # Instance Prisma
│   │   ├── logger.js            # Logging (Pino)
│   │   ├── exceptions.js        # Classes d'exceptions
│   │   ├── validate.js          # Validation des données
│   │   └── async-handler.js     # Gestion des erreurs async
│   │
│   ├── schemas/                 # Schémas de validation (Zod)
│   │   └── user.schema.js
│   │
│   ├── dto/                     # Data Transfer Objects
│   │   └── user.dto.js
│   │
│   └── utils/                   # Utilitaires
│       └── emailTemplate.js     # Templates d'emails
│
├── prisma/                      # Prisma ORM
│   ├── schema.prisma            # Schéma de base de données
│   └── migrations/              # Migrations de BD
│       ├── 20251224222552_init_db/
│       └── 20260107050842_fix_password_nullable/
│
├── docs/                        # Documentation Yaak (requêtes HTTP)
│
├── .env.example                 # Variables d'environnement (template)
├── package.json                 # Dépendances et scripts
└── README.md                    # Ce fichier
```

---

## 🔧 Technologie Stack

### Backend
- **Express.js** (5.2.1) - Framework Web
- **Node.js** - Runtime JavaScript côté serveur

### Base de données
- **SQLite** - Base de données légère
- **Prisma** (6.19.1) - ORM et migration
- **better-sqlite3** - Driver SQLite

### Authentification & Sécurité
- **Passport.js** (0.7.0) - Middleware d'authentification
- **passport-google-oauth20** - Authentification Google
- **JSON Web Tokens (JWT)** - Tokens de session
- **bcrypt** (6.0.0) - Hachage de mots de passe
- **argon2** (0.44.0) - Alternative de hachage sécurisée
- **speakeasy** (2.0.0) - 2FA TOTP
- **qrcode** (1.5.4) - Génération de codes QR

### Email
- **SendGrid** - Service d'envoi d'emails
- **Nodemailer** - Client email SMTP
- **Resend** - Alternative d'envoi d'emails

### Sécurité HTTP
- **Helmet** (8.1.0) - En-têtes de sécurité HTTP
- **CORS** - Partage des ressources cross-origin
- **express-rate-limit** (8.2.1) - Limitation de débit

### Validation & Logging
- **Zod** (4.3.5) - Validation de schémas
- **Pino** (10.1.1) - Logger performant
- **pino-http** - Middleware HTTP pour Pino
- **pino-pretty** - Formatage des logs

### Utilitaires
- **dotenv** (17.2.3) - Gestion des variables d'environnement
- **jose** (6.1.3) - Bibliothèque JWT alternative

---

## 🗄️ Modèle de données

### User (Utilisateur)
```javascript
{
  id: String (UUID),
  email: String (unique),
  password: String? (hashée),
  firstName: String?,
  lastName: String?,
  emailVerifiedAt: DateTime?,
  twoFactorSecret: String? (TOTP secret),
  twoFactorEnabledAt: DateTime?,
  disabledAt: DateTime?,
  createdAt: DateTime,
  updatedAt: DateTime,
  
  // Relations
  oAuthAccounts: OAuthAccount[],
  refreshTokens: RefreshToken[],
  blacklistedAccessTokens: BlacklistedAccessToken[],
  verificationTokens: VerificationToken[],
  passwordResetTokens: PasswordResetToken[],
  loginHistories: LoginHistory[]
}
```

### OAuthAccount (Comptes OAuth liés)
```javascript
{
  id: String (CUID),
  provider: String (ex: "google"),
  providerId: String,
  userId: String (FK),
  createdAt: DateTime
}
```

### RefreshToken (Tokens de rafraîchissement)
```javascript
{
  id: String (CUID),
  token: String (unique),
  userId: String (FK),
  userAgent: String?,
  ipAddress: String?,
  expiresAt: DateTime,
  revokedAt: DateTime?,
  createdAt: DateTime
}
```

### BlacklistedAccessToken (Tokens d'accès révoqués)
```javascript
{
  id: String (CUID),
  token: String (unique),
  userId: String (FK),
  expiresAt: DateTime,
  createdAt: DateTime
}
```

### VerificationToken & PasswordResetToken
```javascript
{
  id: String (CUID),
  token: String (unique),
  userId: String (FK),
  expiresAt: DateTime,
  createdAt: DateTime
}
```

### LoginHistory (Historique des connexions)
```javascript
{
  id: String (CUID),
  userId: String (FK),
  ipAddress: String?,
  userAgent: String?,
  success: Boolean,
  loginMethod: String?,
  createdAt: DateTime
}
```

---

## 📡 Endpoints API

### Authentification (`/api/auth`)

#### POST `/register`
Inscription d'un nouvel utilisateur
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Réponse (201):**
```json
{
  "user": { "id": "...", "email": "user@example.com", ... },
  "message": "User registered successfully"
}
```

#### POST `/login`
Connexion avec email/mot de passe
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
**Réponse (200):**
```json
{
  "user": { "id": "...", "email": "user@example.com" },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### POST `/refresh-token`
Rafraîchir le token d'accès
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### POST `/logout` (Protégé)
Déconnexion
**Headers:** `Authorization: Bearer <accessToken>`

### Utilisateurs (`/api/users`)

#### GET `/me` (Protégé)
Récupérer le profil de l'utilisateur courant

#### PUT `/me` (Protégé)
Mettre à jour le profil
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### OAuth & 2FA (`/api/oauth`, `/api/2fa`)

#### GET `/google`
Redirection vers Google OAuth

#### GET `/google/callback`
Callback Google OAuth

#### POST `/2fa/setup` (Protégé)
Configurer la 2FA
**Réponse:**
```json
{
  "secret": "...",
  "qrCode": "data:image/png;base64,..."
}
```

#### POST `/2fa/verify` (Protégé)
Vérifier la 2FA
```json
{
  "code": "123456"
}
```

### Email (`/api/email`)

#### POST `/verify-email`
Demander une vérification d'email
```json
{
  "email": "user@example.com"
}
```

#### POST `/verify-token`
Vérifier le token d'email
```json
{
  "token": "..."
}
```

### Mot de passe (`/api/password`)

#### POST `/forgot`
Demander une réinitialisation de mot de passe
```json
{
  "email": "user@example.com"
}
```

#### POST `/reset`
Réinitialiser le mot de passe
```json
{
  "token": "...",
  "newPassword": "NewPassword123!"
}
```

---

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1h

# Email (Gmail/SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM="Your App Name"

# OAuth Google
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

---

## 🚀 Installation & Lancement

### Prérequis
- Node.js (v16+)
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd systme_auth_with_express
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

4. **Initialiser la base de données**
```bash
npm run db:push        # Pusher le schéma
npm run db:generate    # Générer Prisma Client
```

5. **Peuplage initial (optionnel)**
```bash
node src/seed.js
```

### Scripts disponibles

```bash
# Développement avec rechargement automatique
npm run dev

# Production
npm start

# Base de données
npm run db:generate    # Générer Prisma Client
npm run db:push        # Synchroniser le schéma
npm run db:migrate     # Créer une migration
npm run db:studio      # Interface Prisma Studio
```

---

## 🔒 Sécurité

### Bonnes pratiques implémentées

1. **Hachage des mots de passe** - bcrypt/argon2
2. **JWT tokens** - Avec expiration et refresh
3. **Blacklist de tokens** - Tokens révoqués non valides
4. **Rate limiting** - Protection contre les abus
5. **CORS** - Contrôle des origines
6. **Helmet** - En-têtes de sécurité HTTP
7. **Validation** - Zod schemas
8. **2FA TOTP** - Authentification à deux facteurs
9. **HTTPS Ready** - Support HTTPS
10. **Historique de connexion** - Audit des accès

### Recommandations supplémentaires

- ⚠️ Utiliser HTTPS en production
- ⚠️ Garder les secrets en variables d'environnement
- ⚠️ Valider tous les inputs côté serveur
- ⚠️ Implémenter CSRF protection si nécessaire
- ⚠️ Monitorer les logs pour les tentatives suspectes
- ⚠️ Rotationner régulièrement les secrets

---

## 🧪 Middleware & Utilitaires

### Middlewares

- **auth.middleware.js** - Vérifie JWT et protège les routes
- **error-handler.js** - Gère les erreurs globalement
- **not-found.js** - Gère les routes non trouvées (404)
- **rate-limit.js** - Limite le nombre de requêtes
- **Email.middleware.js** - Middleware pour les emails

### Services

- **Token.service.js** - Génération et gestion des tokens
- **Email.service.js** - Envoi d'emails
- **2fa.service.js** - Gestion 2FA/TOTP
- **oauth.service.js** - Gestion OAuth
- **user.service.js** - Opérations utilisateur

---

## 📝 Exemples d'utilisation

### Inscription et connexion basique

```javascript
// Inscription
const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// Connexion
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const { accessToken, refreshToken } = await loginResponse.json();

// Utiliser le token pour les routes protégées
const profileResponse = await fetch('http://localhost:3000/api/users/me', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

---

## 🐛 Dépannage

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `ENOENT: no such file or directory` | BD non initialisée | `npm run db:push` |
| `JWT expired` | Token expiré | Utiliser refresh-token |
| `Email not verified` | Vérification requise | Vérifier l'email d'abord |
| `Rate limit exceeded` | Trop de requêtes | Attendre ou augmenter la limite |
| `Invalid credentials` | Email/password incorrect | Vérifier les identifiants |

---

## 📚 Documentation supplémentaire

### Fichiers importants à consulter

- [package.json](package.json) - Dépendances et scripts
- [Schéma Prisma](prisma/schema.prisma) - Structure BD
- [Auth Controller](src/controllers/auth.controller.js) - Logique d'auth
- [Auth Routes](src/routes/auth.routes.js) - Endpoints auth
- [Email Service](src/services/Email.service.js) - Gestion des emails

---

## 📄 License

À définir

---

## 👨‍💻 Auteur

Créé avec ❤️ pour un système d'authentification robuste

---

## 🤝 Contribution

Les contributions sont bienvenues ! Veuillez créer une branche feature et soumettre une pull request.

---

**Dernière mise à jour:** 12 janvier 2026  
**Statut:** 🟢 En développement actif
