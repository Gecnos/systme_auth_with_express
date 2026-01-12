# Documentation API - Système d'Authentification Express

## 📖 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Endpoints complets](#endpoints-complets)
4. [Codes d'erreur](#codes-derreur)
5. [Exemples cURL](#exemples-curl)

---

## Vue d'ensemble

**URL de base:** `http://localhost:3000/api`  
**Version:** 1.0.0  
**Authentification:** JWT Bearer Token

### En-têtes requis
```
Content-Type: application/json
Authorization: Bearer <accessToken>  (pour les routes protégées)
```

---

## Authentification

L'API utilise **JWT (JSON Web Tokens)** pour l'authentification. Après une connexion réussie, vous recevez:

- **accessToken** - Court terme (1h par défaut) pour accéder aux ressources
- **refreshToken** - Long terme pour obtenir un nouveau accessToken

### Format du Bearer Token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Endpoints complets

### 🔐 Authentification

#### 1. **POST /auth/register** - Inscription
Crée un nouveau compte utilisateur.

**Requête:**
```http
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Réponse (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerifiedAt": null,
    "createdAt": "2026-01-12T10:30:00Z",
    "updatedAt": "2026-01-12T10:30:00Z"
  },
  "verificationEmailSent": true
}
```

**Validation:**
- `email` - Email valide et unique
- `password` - Minimum 8 caractères, au moins 1 majuscule, 1 chiffre, 1 caractère spécial
- `firstName` - Optionnel
- `lastName` - Optionnel

**Erreurs possibles:**
- 400: Email invalide ou déjà utilisé
- 400: Mot de passe faible
- 429: Trop de tentatives

---

#### 2. **POST /auth/login** - Connexion
Authentifie un utilisateur avec ses identifiants.

**Requête:**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerifiedAt": "2026-01-12T10:35:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE2MzI2Nzk4MDB9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0eXBlIjoicmVmcmVzaEtleSIsImlhdCI6MTYzMjY3OTgwMH0.F6H5F7L1Q2B3D6K9M2P5R8T1V4X7Z0C3E6G9I2L5"
}
```

**Erreurs possibles:**
- 401: Identifiants invalides
- 400: Email non trouvé
- 429: Trop de tentatives

---

#### 3. **POST /auth/refresh-token** - Rafraîchir le token
Obtient un nouveau accessToken avec un refreshToken valide.

**Requête:**
```http
POST /api/auth/refresh-token HTTP/1.1
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erreurs possibles:**
- 401: Refresh token invalide ou expiré
- 401: Refresh token révoqué

---

#### 4. **POST /auth/logout** - Déconnexion
Révoque le token d'accès et invalide la session.

**Requête:**
```http
POST /api/auth/logout HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Erreurs possibles:**
- 401: Token invalide ou manquant
- 401: Non authentifié

---

### 👤 Utilisateurs

#### 5. **GET /users/me** - Récupérer le profil
Retourne les informations du profil utilisateur courant.

**Requête:**
```http
GET /api/users/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerifiedAt": "2026-01-12T10:35:00Z",
    "twoFactorEnabledAt": null,
    "disabledAt": null,
    "createdAt": "2026-01-12T10:30:00Z",
    "updatedAt": "2026-01-12T11:00:00Z"
  }
}
```

**Erreurs possibles:**
- 401: Non authentifié
- 401: Token expiré

---

#### 6. **PUT /users/me** - Mettre à jour le profil
Modifie les informations du profil utilisateur.

**Requête:**
```http
PUT /api/users/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "updatedAt": "2026-01-12T11:05:00Z"
  }
}
```

**Erreurs possibles:**
- 401: Non authentifié
- 400: Données invalides

---

#### 7. **GET /users/me/login-history** - Historique de connexion
Récupère l'historique des connexions.

**Requête:**
```http
GET /api/users/me/login-history?limit=10&offset=0 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Paramètres de requête:**
- `limit` (optionnel) - Nombre de résultats (défaut: 10)
- `offset` (optionnel) - Décalage (défaut: 0)

**Réponse (200 OK):**
```json
{
  "success": true,
  "loginHistories": [
    {
      "id": "6f8f1c29-5b5d-4e2c-9f3e-2d7c1b4a9e0f",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "success": true,
      "loginMethod": "email",
      "createdAt": "2026-01-12T11:00:00Z"
    }
  ],
  "total": 45,
  "limit": 10,
  "offset": 0
}
```

---

### 🔑 2FA (Authentification à deux facteurs)

#### 8. **POST /2fa/setup** - Configurer la 2FA
Génère un secret TOTP et un code QR pour la 2FA.

**Requête:**
```http
POST /api/2fa/setup HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "2FA setup initiated",
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAY...",
  "backupCodes": [
    "BACKUP-CODE-1",
    "BACKUP-CODE-2",
    "BACKUP-CODE-3",
    "BACKUP-CODE-4",
    "BACKUP-CODE-5"
  ]
}
```

---

#### 9. **POST /2fa/verify** - Vérifier la 2FA
Valide le code TOTP et active la 2FA.

**Requête:**
```http
POST /api/2fa/verify HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "code": "123456"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

**Erreurs possibles:**
- 400: Code invalide ou expiré
- 400: 2FA déjà activée

---

#### 10. **POST /2fa/disable** - Désactiver la 2FA
Désactive la 2FA pour l'utilisateur.

**Requête:**
```http
POST /api/2fa/disable HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "password": "SecurePassword123!"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

---

### 📧 Email

#### 11. **POST /email/verify-email** - Demander une vérification
Envoie un email de vérification.

**Requête:**
```http
POST /api/email/verify-email HTTP/1.1
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

**Erreurs possibles:**
- 400: Email non trouvé
- 400: Email déjà vérifié
- 429: Trop de tentatives

---

#### 12. **POST /email/verify-token** - Vérifier le token
Valide le token de vérification d'email.

**Requête:**
```http
POST /api/email/verify-token HTTP/1.1
Content-Type: application/json

{
  "token": "verification_token_here"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "emailVerifiedAt": "2026-01-12T11:10:00Z"
  }
}
```

**Erreurs possibles:**
- 400: Token invalide ou expiré
- 400: Email déjà vérifié

---

### 🔐 Mot de passe

#### 13. **POST /password/forgot** - Demander une réinitialisation
Envoie un email de réinitialisation de mot de passe.

**Requête:**
```http
POST /api/password/forgot HTTP/1.1
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Erreurs possibles:**
- 400: Email non trouvé
- 429: Trop de tentatives

---

#### 14. **POST /password/reset** - Réinitialiser le mot de passe
Valide le token et réinitialise le mot de passe.

**Requête:**
```http
POST /api/password/reset HTTP/1.1
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "NewSecurePassword456!"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Validation:**
- `newPassword` - Même règles que l'inscription
- `token` - Doit être valide et non expiré

**Erreurs possibles:**
- 400: Token invalide ou expiré
- 400: Mot de passe faible
- 404: Utilisateur non trouvé

---

### 🔗 OAuth

#### 15. **GET /auth/google** - Redirection Google OAuth
Redirige vers Google pour l'authentification.

**Requête:**
```http
GET /api/auth/google HTTP/1.1
```

**Réponse:**
Redirection HTTP 302 vers Google OAuth

---

#### 16. **GET /auth/google/callback** - Callback Google
Callback après authentification Google (géré automatiquement).

**Réponse (302 ou 200):**
Redirection vers le frontend avec tokens ou réponse JSON avec tokens

---

## Codes d'erreur

### Codes HTTP utilisés

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | Succès | Opération réussie |
| 201 | Créé | Utilisateur enregistré |
| 400 | Mauvaise requête | Données invalides |
| 401 | Non authentifié | Token manquant/expiré |
| 403 | Interdit | Permissions insuffisantes |
| 404 | Non trouvé | Ressource inexistante |
| 429 | Trop de requêtes | Rate limit dépassé |
| 500 | Erreur serveur | Bug du serveur |

### Format d'erreur standard

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2026-01-12T11:15:00Z"
}
```

### Codes d'erreur spécifiques

- `INVALID_EMAIL` - Email invalide
- `EMAIL_ALREADY_EXISTS` - Email déjà utilisé
- `INVALID_PASSWORD` - Mot de passe faible
- `INVALID_CREDENTIALS` - Email/password incorrect
- `TOKEN_EXPIRED` - Token expiré
- `TOKEN_INVALID` - Token invalide
- `NOT_AUTHENTICATED` - Non authentifié
- `EMAIL_NOT_VERIFIED` - Email non vérifié
- `2FA_REQUIRED` - 2FA requise
- `RATE_LIMIT_EXCEEDED` - Trop de requêtes
- `USER_NOT_FOUND` - Utilisateur non trouvé
- `VALIDATION_ERROR` - Erreur de validation

---

## Exemples cURL

### Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

### Récupérer le profil
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Rafraîchir le token
```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Déconnexion
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Vérifier un email
```bash
curl -X POST http://localhost:3000/api/email/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### Configurer la 2FA
```bash
curl -X POST http://localhost:3000/api/2fa/setup \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Vérifier la 2FA
```bash
curl -X POST http://localhost:3000/api/2fa/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

---

**Dernière mise à jour:** 12 janvier 2026
