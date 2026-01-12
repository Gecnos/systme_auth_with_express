# 🔒 Guide de Sécurité - Système d'Authentification Express

## Table des matières
1. [Principes de sécurité](#principes-de-sécurité)
2. [Sécurité de l'authentification](#sécurité-de-lauthentification)
3. [Sécurité des données](#sécurité-des-données)
4. [Sécurité du serveur](#sécurité-du-serveur)
5. [Audit de sécurité](#audit-de-sécurité)
6. [Compliance](#compliance)

---

## Principes de sécurité

### 1. Défense en profondeur
Ne dépendez pas d'une seule couche de sécurité:

```
Frontend (validation) → Transport (HTTPS) → Backend (validation)
                                              ↓
                                    Middleware (auth)
                                              ↓
                                    Logique métier
                                              ↓
                                    Base de données
```

### 2. Moindre privilège
Accordez le minimum de permissions nécessaires:

```javascript
// ✅ Correct - Seulement le minimum
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true }  // Pas de password!
})

// ❌ Incorrect - Trop d'informations
const user = await prisma.user.findUnique({
  where: { id: userId }
})  // Retourne le mot de passe haché!
```

### 3. Fail secure
En cas d'erreur, refusez l'accès:

```javascript
// ✅ Correct - Refuse par défaut
let isValid = false
try {
  isValid = await verifyToken(token)
} catch (error) {
  logger.error('Token verification failed', error)
  // isValid reste false
}
if (!isValid) throw new UnauthorizedException()

// ❌ Incorrect - Accepte par défaut
let isValid = true
try {
  isValid = !await verifyToken(token)
} catch (error) {
  // Accepte si erreur!
}
if (!isValid) throw new UnauthorizedException()
```

### 4. Sécurité par obscurité non suffisante
Ne comptez pas sur le secret de votre implémentation:

```javascript
// ✅ Correct - Utilise des algorithmes standards
const hash = await hashPassword(password, { algorithm: 'bcrypt', rounds: 12 })

// ❌ Incorrect - Algorithme propriétaire
const hash = myCustomHash(password + salt)
```

---

## Sécurité de l'authentification

### Mot de passe

#### Politique de mot de passe
```javascript
// src/lib/password.js
export const validatePassword = (password) => {
  const errors = []
  
  if (password.length < 12) {
    errors.push('Au minimum 12 caractères')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins 1 majuscule')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins 1 minuscule')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins 1 chiffre')
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Au moins 1 caractère spécial (!@#$%^&*)')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### Hachage du mot de passe
```javascript
// ✅ Utiliser bcrypt ou argon2
import bcrypt from 'bcrypt'

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)  // 12 rounds
}

export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

// ❌ Ne JAMAIS faire
const password = hashPassword(password, salt)  // SHA1 / MD5
const password = Buffer.from(password).toString('base64')  // Juste encodé
```

#### Expiration de mot de passe
```javascript
// src/services/user.service.js
export const checkPasswordExpired = (user) => {
  const passwordExpiryDays = 90
  const lastPasswordChange = user.passwordChangedAt || user.createdAt
  const daysSinceChange = (Date.now() - lastPasswordChange) / (1000 * 60 * 60 * 24)
  
  return daysSinceChange > passwordExpiryDays
}

// Utilisation
if (checkPasswordExpired(user)) {
  throw new BadRequestException('Mot de passe expiré. Veuillez le réinitialiser.')
}
```

### JWT (JSON Web Tokens)

#### Configuration sécurisée
```javascript
// src/lib/jwt.js
import jwt from 'jsonwebtoken'

export const sign = (payload, secret, options = {}) => {
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',  // Toujours spécifier l'algorithme
    expiresIn: '1h',
    ...options
  })
}

export const verify = (token, secret) => {
  try {
    return jwt.verify(token, secret, {
      algorithms: ['HS256']  // Restreindre les algorithmes acceptés
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expiré')
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Token invalide')
    }
    throw error
  }
}
```

#### Révocation de tokens
```javascript
// src/services/Token.service.js
export const revokeToken = async (token, userId) => {
  const decoded = jwt.decode(token)
  
  await prisma.blacklistedAccessToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(decoded.exp * 1000)  // Purger après expiration
    }
  })
}

// Vérifier la blacklist
export const isTokenBlacklisted = async (token, userId) => {
  const blacklisted = await prisma.blacklistedAccessToken.findUnique({
    where: { token }
  })
  return blacklisted !== null
}

// Vérifier dans le middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    
    // ✅ Vérifier la blacklist
    const isBlacklisted = await isTokenBlacklisted(token, payload.sub)
    if (isBlacklisted) {
      throw new UnauthorizedException('Token révoqué')
    }
    
    req.user = payload
    next()
  } catch (error) {
    next(error)
  }
}
```

### 2FA (Authentification à deux facteurs)

#### TOTP sécurisé
```javascript
// src/services/2fa.service.js
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

export const generate2FASecret = async (user) => {
  const secret = speakeasy.generateSecret({
    name: `${process.env.APP_NAME} (${user.email})`,
    issuer: process.env.APP_NAME,
    length: 32  // Clé plus longue = plus sécurisée
  })
  
  const qrCode = await qrcode.toDataURL(secret.otpauth_url)
  
  return {
    secret: secret.base32,
    qrCode,
    backupCodes: generateBackupCodes(10)  // Codes de secours
  }
}

export const verify2FACode = (secret, code) => {
  // ✅ Vérifier avec une fenêtre de temps (grace period)
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 2  // Permet ±2 codes (±30 secondes)
  })
}

// Codes de secours
export const generateBackupCodes = (count = 10) => {
  return Array.from({ length: count }).map(() => {
    return require('crypto').randomBytes(4).toString('hex').toUpperCase()
  })
}

export const verifyBackupCode = async (userId, code) => {
  const backupCode = await prisma.backupCode.findFirst({
    where: {
      userId,
      code: bcrypt.hashSync(code, 10),  // Hachage du code
      used: false
    }
  })
  
  if (backupCode) {
    // Marquer comme utilisé
    await prisma.backupCode.update({
      where: { id: backupCode.id },
      data: { used: true }
    })
    return true
  }
  
  return false
}
```

#### Désactiver la 2FA en toute sécurité
```javascript
export const disable2FA = async (userId, password) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true }
  })
  
  // Vérifier le mot de passe
  const isValid = await comparePassword(password, user.password)
  if (!isValid) {
    throw new UnauthorizedException('Mot de passe incorrect')
  }
  
  // Désactiver
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      twoFactorEnabledAt: null
    }
  })
  
  // Logger pour audit
  logger.info('2FA disabled', { userId })
}
```

### Session Management

#### Refresh token rotation
```javascript
// src/routes/auth.routes.js
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    
    // Vérifier et décoder
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET)
    
    // Vérifier en BD
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    })
    
    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new UnauthorizedException('Refresh token invalide')
    }
    
    // Vérifier l'expiration
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expiré')
    }
    
    // Rotation: créer un nouveau refresh token
    const newAccessToken = sign({ sub: payload.sub })
    const newRefreshToken = sign(
      { sub: payload.sub, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Révoquer l'ancien refresh token
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revokedAt: new Date() }
    })
    
    // Créer le nouveau
    await prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    })
    
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  } catch (error) {
    next(error)
  }
}
```

---

## Sécurité des données

### HTTPS/TLS
```javascript
// ✅ Force HTTPS en production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.get('host') + req.url)
  }
  next()
})

// Nginx reverse proxy configuration
server {
  listen 443 ssl http2;
  server_name api.example.com;
  
  ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
  
  # Security headers
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  
  location / {
    proxy_pass http://localhost:3000;
  }
}
```

### CORS sécurisé
```javascript
// ✅ Restreindre les origines
import cors from 'cors'

app.use(cors({
  origin: [
    'https://app.example.com',
    'https://admin.example.com'
    // ❌ JAMAIS: '*' en production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### Protection contre le XSS
```javascript
// ✅ Helmet ajoute les en-têtes
import helmet from 'helmet'
app.use(helmet())

// ✅ Nettoyer les inputs
import xss from 'xss'

const sanitize = (input) => {
  return xss(input, {
    whiteList: {},  // Aucune balise HTML
    stripIgnoredTag: true
  })
}

// Utilisation
const { firstName } = req.body
const sanitizedFirstName = sanitize(firstName)
```

### Protection SQL Injection
```javascript
// ✅ Prisma protège automatiquement
const user = await prisma.user.findUnique({
  where: { email: userInput }  // Paramétré
})

// ❌ JAMAIS de template string
const user = await db.query(`SELECT * FROM users WHERE email = '${userInput}'`)
```

### Encryption des données sensibles
```javascript
// src/lib/encryption.js
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32)

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
}

export const decrypt = (encrypted) => {
  const [iv, text, authTag] = encrypted.split(':')
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  )
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(text, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Utilisation pour les données sensibles
const encryptedPhone = encrypt(phoneNumber)
```

---

## Sécurité du serveur

### Rate Limiting
```javascript
// src/middlewares/rate-limit.js
import rateLimit from 'express-rate-limit'

// Limit global
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false
})

// Login limiter - plus strict
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // 5 tentatives
  message: 'Trop de tentatives de connexion',
  skipSuccessfulRequests: true  // Ne compte que les erreurs
})

// Registration limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 heure
  max: 3,  // 3 inscriptions par heure
  message: 'Trop d\'inscriptions, veuillez réessayer demain'
})

// Utilisation
router.post('/login', loginLimiter, loginController)
router.post('/register', registerLimiter, registerController)
```

### Logging et monitoring
```javascript
// src/lib/logger.js
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

// Logging des événements de sécurité
export const securityLogger = (event, details) => {
  logger.warn({
    type: 'SECURITY_EVENT',
    event,
    ...details,
    timestamp: new Date().toISOString()
  })
}

// Utilisation
securityLogger('FAILED_LOGIN_ATTEMPT', {
  email: user.email,
  ipAddress: req.ip,
  attempts: loginAttempts
})

securityLogger('UNAUTHORIZED_ACCESS', {
  userId: req.user?.id,
  resource: req.path,
  ipAddress: req.ip
})
```

### Environment variables
```javascript
// ✅ Toujours utiliser dotenv
import 'dotenv/config'

// ✅ Valider au démarrage
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'MAIL_PASSWORD'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable d'environnement manquante: ${envVar}`)
  }
}

// ❌ JAMAIS hardcoder les secrets
const secret = 'my_secret_key'  // ❌ TRÈS MAUVAIS

// ✅ Utiliser les env vars
const secret = process.env.JWT_SECRET
```

---

## Audit de sécurité

### Logging des accès
```javascript
// src/services/audit.service.js
export const logAccessEvent = async (req, userId) => {
  await prisma.accessLog.create({
    data: {
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      timestamp: new Date()
    }
  })
}

// Middleware
app.use((req, res, next) => {
  const originalSend = res.send
  
  res.send = function(data) {
    if (req.user) {
      logAccessEvent(req, req.user.id)
    }
    return originalSend.call(this, data)
  }
  
  next()
})
```

### Détection d'anomalies
```javascript
// Détecter les tentatives suspectes
export const detectSuspiciousActivity = async (userId, ipAddress) => {
  const recentLogins = await prisma.loginHistory.findMany({
    where: {
      userId,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }  // 1h
    }
  })
  
  const uniqueIPs = new Set(recentLogins.map(l => l.ipAddress))
  
  // Plus de 5 IPs différentes en 1h = suspect
  if (uniqueIPs.size > 5) {
    securityLogger('SUSPICIOUS_ACTIVITY', {
      userId,
      reason: 'Multiple IP addresses',
      ipCount: uniqueIPs.size
    })
    
    // Optionnel: Forcer la 2FA
    // await require2FA(userId)
  }
}
```

---

## Compliance

### RGPD (GDPR)
```javascript
// src/services/compliance.service.js
export const deleteUserData = async (userId) => {
  // Droit à l'oubli
  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { userId } }),
    prisma.verificationToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.loginHistory.deleteMany({ where: { userId } }),
    prisma.oAuthAccount.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } })
  ])
  
  logger.info('User data deleted (GDPR)', { userId })
}

export const exportUserData = async (userId) => {
  // Droit à la portabilité
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      loginHistories: true,
      oAuthAccounts: true
    }
  })
}
```

### Privacy
```javascript
// ✅ Política de confidentialité
app.get('/privacy', (req, res) => {
  res.json({
    policy: {
      dataCollection: 'We collect email and profile information only',
      dataUsage: 'Your data is used only for authentication',
      retention: 'Data is deleted upon user request',
      thirdParties: 'We use Google OAuth for authentication'
    }
  })
})

// ✅ Terms of Service
app.get('/terms', (req, res) => {
  res.json({
    terms: {
      usage: 'Do not use for malicious purposes',
      liability: 'We are not liable for data loss',
      compliance: 'By using this service, you agree to our policies'
    }
  })
})
```

---

## Checklist de sécurité pre-production

- [ ] Tous les secrets dans les env vars (pas en dur)
- [ ] HTTPS activé et certificat valide
- [ ] CORS configuré pour les domaines corrects
- [ ] Rate limiting activé
- [ ] Helmet configuré
- [ ] Logs de sécurité en place
- [ ] 2FA recommandé pour les comptes admin
- [ ] Bcrypt/Argon2 pour les mots de passe (min 12 rounds)
- [ ] JWT avec expiration courte
- [ ] Blacklist de tokens implémentée
- [ ] Validations strictes des inputs
- [ ] Gestion des erreurs sans révéler d'infos
- [ ] Backups automatiques configurés
- [ ] Monitoring et alertes actifs
- [ ] Policy de sécurité documentée
- [ ] Données sensibles chiffrées
- [ ] Audit logs persistants

---

**Dernière mise à jour:** 12 janvier 2026
