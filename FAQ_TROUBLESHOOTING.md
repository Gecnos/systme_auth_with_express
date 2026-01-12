# FAQ & Troubleshooting - Système d'Authentification Express

## ❓ Questions fréquemment posées

### Installation & Configuration

#### Q: Comment installer le projet?
**R:** Voir [SETUP_GUIDE.md](SETUP_GUIDE.md) pour les instructions complètes.

```bash
git clone <repo>
npm install
cp .env.example .env
npm run db:push
npm run dev
```

---

#### Q: Quelle version de Node.js est requise?
**R:** Node.js 16.x ou supérieur. Vérifiez votre version:
```bash
node --version  # Doit être v16.0.0 ou plus
```

---

#### Q: Comment configurer Gmail pour envoyer des emails?
**R:** Suivez ces étapes:

1. Activez la 2FA sur votre compte Gmail
2. Créez un mot de passe d'application:
   - Allez à https://myaccount.google.com/apppasswords
   - Sélectionnez Mail et Windows
   - Copiez le mot de passe généré

3. Configurez `.env`:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre_email@gmail.com
MAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx  # Mot de passe généré
MAIL_FROM="Nom de l'app"
MAIL_SECURE=false
```

---

#### Q: Comment obtenir les identifiants Google OAuth?
**R:** 

1. Allez à [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Activez "Google+ API"
4. Créez des credentials OAuth 2.0 (Web application)
5. Ajoutez `http://localhost:3000/api/auth/google/callback` dans les origines autorisées
6. Copiez Client ID et Secret dans `.env`

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

---

#### Q: Comment changer la base de données de SQLite à PostgreSQL?
**R:** 

1. Installez PostgreSQL
2. Créez une base de données
3. Modifiez `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Mettez à jour `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/authdb"
```

5. Poussez le schéma:
```bash
npm run db:push
```

---

### Erreurs courantes

#### ❌ "ENOENT: no such file or directory 'prisma/dev.db'"
**Cause:** La base de données n'a pas été créée  
**Solution:**
```bash
npm run db:push
```

---

#### ❌ "JWT malformed" ou "Invalid token"
**Cause:** Token JWT invalide ou expiré  
**Solution:**
- Le token doit être dans le format `Bearer <token>`
- Vérifiez que le token n'a pas expiré
- Utilisez le refresh token pour obtenir un nouveau token d'accès

```bash
# Correct
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Incorrect
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### ❌ "Cannot find module '@sendgrid/mail'"
**Cause:** SendGrid non installé  
**Solution:**
```bash
npm install @sendgrid/mail
```

---

#### ❌ "Error: connect ECONNREFUSED 127.0.0.1:5432"
**Cause:** PostgreSQL ne s'exécute pas  
**Solution:**
```bash
# Linux/Mac
brew services start postgresql

# Windows
net start postgresql-x64-14  # Adaptez le numéro de version

# Docker
docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres
```

---

#### ❌ "Email not verified"
**Cause:** L'utilisateur n'a pas vérifié son email  
**Solution:**
- Envoyer un email de vérification via POST `/api/email/verify-email`
- Cliquer sur le lien ou utiliser le token fourni
- Vérifier le email avec POST `/api/email/verify-token`

---

#### ❌ "Rate limit exceeded"
**Cause:** Trop de requêtes d'un même IP  
**Solution:**
- Attendre 15 minutes (par défaut)
- Ou augmenter les limites dans `.env`:
```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

---

#### ❌ "Failed to send email"
**Cause:** Configuration SMTP incorrecte  
**Solution:**

1. Vérifiez les paramètres SMTP:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre_email@gmail.com
MAIL_PASSWORD=mot_de_passe_app
MAIL_SECURE=false
```

2. Testez la connexion:
```bash
curl -v smtp.gmail.com:587
```

3. Vérifiez que "Accès des apps moins sécurisées" est activé (Gmail)

---

#### ❌ "prisma:error Error code: P1000"
**Cause:** Impossible de se connecter à la base de données  
**Solution:**

1. Vérifiez que la BD est en cours d'exécution
2. Vérifiez l'URL de connexion dans `DATABASE_URL`
3. Pour SQLite, assurez-vous que le dossier existe:
```bash
mkdir -p prisma
```

---

#### ❌ "CORS error" ou "No 'Access-Control-Allow-Origin' header"
**Cause:** Le frontend n'est pas dans les origines autorisées  
**Solution:**

Modifiez `src/index.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://votredomaine.com'
  ],
  credentials: true
}))
```

---

#### ❌ "Cannot read property 'id' of undefined"
**Cause:** Middleware d'authentification ne définit pas req.user  
**Solution:**

Vérifiez que le middleware d'authentification est appliqué:
```javascript
// routes/user.routes.js
router.get('/me', authMiddleware, getProfile)  // ✅ Correct
router.get('/me', getProfile)  // ❌ Incorrect
```

---

#### ❌ "bcrypt ERR_MODULE_NOT_FOUND"
**Cause:** bcrypt n'est pas installé correctement  
**Solution:**
```bash
npm uninstall bcrypt
npm install bcrypt

# Ou utiliser argon2
npm install argon2
```

---

### Performance & Optimisation

#### Q: Comment améliorer la performance?
**R:**

1. **Indexer les requêtes fréquentes:**
```prisma
model User {
  id       String   @id
  email    String   @unique  // Index automatique
  // ...
}
```

2. **Utiliser PostgreSQL en production** (plus rapide que SQLite)

3. **Activer la mise en cache:**
```javascript
app.use(express.static('public', { maxAge: '1h' }))
```

4. **Limiter les données retournées:**
```javascript
// Utiliser select pour retourner seulement les champs nécessaires
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, firstName: true }
})
```

5. **Utiliser la pagination:**
```javascript
const users = await prisma.user.findMany({
  take: 10,
  skip: (page - 1) * 10
})
```

---

#### Q: Comment monitorer la performance?
**R:**

1. **Ajouter du logging des requêtes:**
```javascript
app.use(pinoHttp({ logger }))
```

2. **Utiliser Prisma Studio:**
```bash
npm run db:studio
```

3. **Monitorer les erreurs avec Sentry:**
```javascript
import * as Sentry from "@sentry/node"

Sentry.init({ dsn: process.env.SENTRY_DSN })
```

---

### Déploiement

#### Q: Comment déployer sur Vercel?
**R:**

1. Créer un compte sur Vercel
2. Connecter votre repo GitHub
3. Ajouter les variables d'environnement
4. Déployer automatiquement

⚠️ Note: Vercel n'est pas optimal pour une API toujours active. Utilisez plutôt Railway ou Render.

---

#### Q: Comment déployer sur Railway?
**R:**

1. Aller à https://railway.app
2. Créer un nouveau projet
3. Connecter votre repo GitHub
4. Ajouter PostgreSQL depuis Marketplace
5. Ajouter les variables d'environnement
6. Déployer

```bash
# Variable de base de données automatique: DATABASE_URL
# Ajouter les autres variables dans le dashboard
```

---

#### Q: Comment ajouter HTTPS en production?
**R:**

1. **Avec Let's Encrypt + Nginx:**
```bash
sudo certbot certonly --standalone -d votredomaine.com
```

2. **Avec Cloudflare:** (gratuit)
   - Ajouter votre domaine à Cloudflare
   - Activer SSL/TLS
   - Mettre à jour les nameservers

3. **Avec l'hébergeur:** (Vercel, Railway, etc. inclus)
   - Ajouter votre domaine
   - HTTPS activé automatiquement

---

### Sécurité

#### Q: Est-ce que mon JWT_SECRET est assez sécurisé?
**R:** Un bon JWT_SECRET doit être:
- Au minimum 32 caractères
- Aléatoire et complexe
- Changé régulièrement

Générez-en un:
```bash
# OpenSSL
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

#### Q: Comment sécuriser la 2FA?
**R:**

1. Stocker le secret TOTP de manière sécurisée:
```javascript
// ✅ Hachage du secret
const hashedSecret = bcrypt.hashSync(secret, 10)

// ❌ Stockage en clair
const secret = secret  // Non!
```

2. Utiliser des codes de secours:
```javascript
const backupCodes = generateBackupCodes(5)
await prisma.backupCode.createMany({
  data: backupCodes.map(code => ({
    userId: user.id,
    code: bcrypt.hashSync(code, 10),
    used: false
  }))
})
```

---

#### Q: Comment prévenir les injections SQL?
**R:** Prisma protège automatiquement contre les injections SQL grâce aux requêtes paramétrées:

```javascript
// ✅ Sécurisé avec Prisma
const user = await prisma.user.findUnique({
  where: { email: userInput }
})

// ❌ JAMAIS faire de requête directe
const user = await db.query(`SELECT * FROM users WHERE email = '${userInput}'`)
```

---

#### Q: Comment sécuriser les uploads de fichiers?
**R:**

1. Valider le type de fichier:
```javascript
const allowedMimes = ['image/jpeg', 'image/png']
if (!allowedMimes.includes(file.mimetype)) {
  throw new BadRequestException('Type de fichier non autorisé')
}
```

2. Limiter la taille:
```javascript
const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5MB
if (file.size > MAX_FILE_SIZE) {
  throw new BadRequestException('Fichier trop volumineux')
}
```

3. Renommer les fichiers:
```javascript
const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`
```

---

### Développement

#### Q: Comment déboguer une requête?
**R:**

1. **Avec les logs:**
```javascript
logger.info('Requête reçue', { body: req.body })
logger.error('Erreur', { error: err.message })
```

2. **Avec Prisma Studio:**
```bash
npm run db:studio
```

3. **Avec VS Code Debugger:**
Ajouter `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.js",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

---

#### Q: Comment tester l'API?
**R:**

1. **Avec cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'
```

2. **Avec Postman/Insomnia:**
   - Importer la collection depuis le dossier `docs/`

3. **Avec tests automatisés:**
```bash
npm install jest supertest --save-dev
npm test
```

---

#### Q: Comment contribuer au projet?
**R:**

1. Fork le repo
2. Créer une branche feature:
```bash
git checkout -b feature/ma-fonctionnalite
```

3. Faire des commits clairs:
```bash
git commit -m "feat: ajouter la 2FA"
```

4. Pusher et créer une Pull Request:
```bash
git push origin feature/ma-fonctionnalite
```

---

### Maintenance

#### Q: Comment nettoyer les tokens expirés?
**R:**

Ajouter une tâche cron:
```javascript
// src/lib/cleanup.js
import cron from 'node-cron'
import prisma from './prisma.js'

export const startCleanupJob = () => {
  // Tous les jours à 2h du matin
  cron.schedule('0 2 * * *', async () => {
    await prisma.blacklistedAccessToken.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    })
    
    await prisma.verificationToken.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    })
  })
}
```

Puis dans `src/index.js`:
```javascript
import { startCleanupJob } from './lib/cleanup.js'
startCleanupJob()
```

---

#### Q: Comment monitorer la santé de l'API?
**R:**

Ajouter un endpoint health check:
```javascript
// src/routes/health.routes.js
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'healthy', timestamp: new Date() })
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message })
  }
})
```

Puis configurer un monitoring:
```bash
# Avec UptimeRobot
# Ajouter: https://votreapi.com/health
```

---

## 🆘 Besoin d'aide?

### Ressources

- 📖 [Documentation Express](https://expressjs.com)
- 📖 [Documentation Prisma](https://www.prisma.io/docs/)
- 📖 [JWT.io](https://jwt.io)
- 📖 [OWASP](https://owasp.org) - Sécurité

### Canaux de support

- Issues GitHub du projet
- Stack Overflow avec tags `express` et `prisma`
- Communautés Discord Node.js

---

**Dernière mise à jour:** 12 janvier 2026
