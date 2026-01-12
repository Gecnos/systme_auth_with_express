# Guide de Développement - Système d'Authentification Express

## 📚 Table des matières
1. [Architecture](#architecture)
2. [Conventions de code](#conventions-de-code)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Patterns utilisés](#patterns-utilisés)
5. [Ajouter une nouvelle fonctionnalité](#ajouter-une-nouvelle-fonctionnalité)
6. [Testing](#testing)

---

## Architecture

### MVC Pattern (Model-View-Controller)

Le projet suit une architecture MVC adaptée à Express:

```
Request → Routes → Controllers → Services → Database
                        ↓
                   Middlewares (Auth, Validation)
                        ↓
                    Response
```

### Couches

1. **Routes** (`src/routes/*.js`)
   - Définissent les endpoints HTTP
   - Associent les controllers aux verbes HTTP
   - Appliquent les middlewares

2. **Controllers** (`src/controllers/*.js`)
   - Gèrent la logique de la requête
   - Valident les inputs
   - Appellent les services
   - Retournent les réponses

3. **Services** (`src/services/*.js`)
   - Contiennent la logique métier réutilisable
   - Pas de dépendances directes à Express
   - Peuvent être utilisés par plusieurs controllers

4. **Middlewares** (`src/middlewares/*.js`)
   - Filtrent et modifient les requêtes
   - Gèrent l'authentification, validation, erreurs
   - Exécutés avant les controllers

5. **Models/Schemas** 
   - Validation avec Zod (`src/schemas/*.js`)
   - Génération Prisma (`prisma/schema.prisma`)

6. **Utils/Lib** (`src/lib/*.js`)
   - Utilitaires réutilisables (JWT, hash, logger, etc.)
   - Pas de logique métier

---

## Conventions de code

### Nommage

```javascript
// Controllers
export const actionName = async (req, res, next) => { }
// Exemple: loginUser, registerNewUser, updateProfile

// Services
class ServiceName { }
export const serviceName = new ServiceName()

// Middlewares
export const middlewareName = (req, res, next) => { }

// Routes
const router = express.Router()
router.method('/path', middlewares, controller)

// Variables
const userId = '...'           // camelCase
const CONSTANT_VALUE = '...'  // UPPER_SNAKE_CASE
const _privateVar = '...'     // underscore prefix pour privé
```

### Structure des fichiers

```javascript
// Import en haut
import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { userController } from '../controllers/user.controller.js'

// Déclaration des variables globales
const router = express.Router()

// Routes publiques en premier, puis protégées
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/me', authMiddleware, userController.getProfile)

// Export
export default router
```

### Gestion des erreurs

Toujours utiliser les exceptions personnalisées:

```javascript
import { BadRequestException, UnauthorizedException } from '../lib/exceptions.js'

// ✅ Correct
throw new BadRequestException('Email déjà utilisé')
throw new UnauthorizedException('Token invalide')

// ❌ Incorrect
throw new Error('Email déjà utilisé')
```

### Async/Await

Toujours utiliser async/await avec try/catch:

```javascript
// ✅ Correct
export const loginUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    return res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

// ❌ Incorrect
export const loginUser = (req, res) => {
  prisma.user.findUnique({ where: { email } })
    .then(user => res.json(user))
    .catch(err => res.status(500).json(err))
}
```

### Logging

Utiliser Pino pour le logging:

```javascript
import { logger } from '../lib/logger.js'

logger.info('Utilisateur créé', { userId: user.id })
logger.error('Erreur de base de données', { error: err.message })
logger.warn('Trop de tentatives', { email })
```

---

## Structure des dossiers

### src/controllers/
Logique métier par domaine:

```javascript
// auth.controller.js
export const register = async (req, res, next) => { }
export const login = async (req, res, next) => { }
export const logout = async (req, res, next) => { }
```

### src/services/
Services réutilisables:

```javascript
// Email.service.js
export const sendVerificationEmail = async (user, token) => { }
export const sendPasswordResetEmail = async (user, token) => { }

// Token.service.js
export const generateAccessToken = (userId) => { }
export const generateRefreshToken = (userId) => { }
export const verifyToken = (token) => { }
```

### src/middlewares/
Middlewares Express:

```javascript
// auth.middleware.js - Vérifie JWT
export const authMiddleware = (req, res, next) => { }

// rate-limit.js - Limite les requêtes
export const globalLimiter = rateLimit({ ... })

// error-handler.js - Gère les erreurs globales
export const errorHandler = (err, req, res, next) => { }
```

### src/lib/
Utilitaires réutilisables:

```javascript
// jwt.js - Gestion JWT
export const sign = (payload, secret, options) => { }
export const verify = (token, secret) => { }

// password.js - Hachage
export const hashPassword = (password) => { }
export const comparePassword = (password, hash) => { }

// logger.js - Logging
export const logger = pino(...)

// exceptions.js - Exceptions personnalisées
export class BadRequestException extends Error { }
```

### src/schemas/
Schémas de validation Zod:

```javascript
// user.schema.js
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional()
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})
```

---

## Patterns utilisés

### 1. Exception Handling Pattern

```javascript
// lib/exceptions.js
export class AppException extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
  }
}

export class BadRequestException extends AppException {
  constructor(message) {
    super(message, 400)
  }
}

// Usage
throw new BadRequestException('Email invalide')
```

### 2. Service Pattern

```javascript
// services/Email.service.js
class EmailService {
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.APP_URL}/verify?token=${token}`
    await this.send(user.email, 'Vérifier votre email', {
      verificationUrl
    })
  }
}

export const emailService = new EmailService()
```

### 3. Validation Pattern

```javascript
// schemas/user.schema.js
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Min 8 caractères')
})

// controllers/auth.controller.js
export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body)
    // ... rest of logic
  } catch (error) {
    next(new BadRequestException(error.message))
  }
}
```

### 4. Middleware Composition

```javascript
// Appliquer plusieurs middlewares
router.post(
  '/protected',
  authMiddleware,
  rateLimitMiddleware,
  validationMiddleware(schema),
  controller
)
```

### 5. Token Management Pattern

```javascript
// lib/jwt.js
export const sign = (payload, secret, options) => {
  return jwt.sign(payload, secret, {
    expiresIn: '1h',
    ...options
  })
}

// Usage
const accessToken = sign({ userId: user.id }, process.env.JWT_SECRET)
const refreshToken = sign(
  { userId: user.id, type: 'refresh' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)
```

---

## Ajouter une nouvelle fonctionnalité

### Exemple: Ajouter une notification SMS

#### 1. Créer le service

```javascript
// src/services/SMS.service.js
import twilio from 'twilio'

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  }

  async sendOTP(phoneNumber, code) {
    await this.client.messages.create({
      body: `Votre code OTP est: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })
  }
}

export const smsService = new SMSService()
```

#### 2. Créer le schéma de validation

```javascript
// src/schemas/sms.schema.js
import { z } from 'zod'

export const sendOTPSchema = z.object({
  phoneNumber: z.string().regex(/^\+\d{10,}$/, 'Numéro invalide')
})
```

#### 3. Créer le controller

```javascript
// src/controllers/sms.controller.js
import { smsService } from '../services/SMS.service.js'
import { sendOTPSchema } from '../schemas/sms.schema.js'

export const sendOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = sendOTPSchema.parse(req.body)
    const code = Math.random().toString().slice(2, 8)
    
    await smsService.sendOTP(phoneNumber, code)
    
    // Stocker le code dans la BD pour vérification ultérieure
    await prisma.otpToken.create({
      data: {
        userId: req.user.id,
        code,
        phoneNumber,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
      }
    })
    
    res.json({
      success: true,
      message: 'Code OTP envoyé'
    })
  } catch (error) {
    next(error)
  }
}
```

#### 4. Créer les routes

```javascript
// src/routes/sms.routes.js
import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { sendOTP } from '../controllers/sms.controller.js'

const router = express.Router()

router.post('/send-otp', authMiddleware, sendOTP)

export default router
```

#### 5. Enregistrer les routes

```javascript
// src/index.js
import smsRoutes from './routes/sms.routes.js'

app.use('/api/sms', smsRoutes)
```

#### 6. Ajouter au schéma Prisma

```prisma
// prisma/schema.prisma
model OTPToken {
  id        String   @id @default(cuid())
  userId    String
  code      String
  phoneNumber String
  verified  Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 7. Exécuter les migrations

```bash
npm run db:migrate
```

---

## Testing

### Structure des tests

```
tests/
├── unit/
│   ├── services/
│   ├── lib/
│   └── utils/
├── integration/
│   ├── auth.test.js
│   ├── users.test.js
│   └── email.test.js
└── e2e/
    └── api.test.js
```

### Exemple de test

```javascript
// tests/integration/auth.test.js
import request from 'supertest'
import app from '../../src/index.js'

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User'
        })

      expect(response.status).toBe(201)
      expect(response.body.user.email).toBe('test@example.com')
    })

    it('should not register with existing email', async () => {
      // ... test
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // ... test
    })
  })
})
```

---

## Bonnes pratiques

### ✅ À faire

- ✅ Utiliser les imports nommés pour les modules
- ✅ Utiliser const au lieu de let/var
- ✅ Ajouter du logging aux opérations critiques
- ✅ Valider tous les inputs avec Zod
- ✅ Utiliser des exceptions personnalisées
- ✅ Ajouter des commentaires aux sections complexes
- ✅ Écrire des tests pour les fonctionnalités critiques
- ✅ Utiliser le pattern async-handler pour les routes

### ❌ À éviter

- ❌ Mélanger logique métier et gestion HTTP
- ❌ Utiliser `any` type en TypeScript
- ❌ Ignorer les erreurs async
- ❌ Stocker des secrets en dur dans le code
- ❌ Modifier directement req/res sans abstraction
- ❌ Faire des requêtes DB dans les routes
- ❌ Oublier de vérifier les permissions

---

## Checklist pour une nouvelle PR

- [ ] Code suit les conventions de nommage
- [ ] Validation des inputs avec Zod
- [ ] Gestion des erreurs avec exceptions
- [ ] Tests unitaires ajoutés
- [ ] Documentation mise à jour
- [ ] Pas de console.log (utiliser logger)
- [ ] Variables d'environnement dans .env.example
- [ ] Messages de commit clairs et descriptifs

---

**Dernière mise à jour:** 12 janvier 2026
