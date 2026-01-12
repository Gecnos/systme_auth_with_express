# 🔧 Commandes utiles - Quick Reference

Une liste des commandes les plus utilisées pour développer rapidement.

---

## 📦 Installation & Lancement

```bash
# Installation initiale
npm install

# Lancement en développement (avec rechargement)
npm run dev

# Lancement en production
npm start

# Installer une nouvelle dépendance
npm install <package-name>

# Installer une dépendance de dev
npm install --save-dev <package-name>
```

---

## 🗄️ Base de données (Prisma)

```bash
# Voir l'interface Prisma Studio (très utile!)
npm run db:studio

# Synchroniser le schéma avec la BD
npm run db:push

# Générer le client Prisma
npm run db:generate

# Créer une nouvelle migration
npm run db:migrate

# Voir l'état des migrations
npx prisma migrate status

# Réinitialiser la BD (ATTENTION: supprime tout!)
npx prisma migrate reset

# Voir le schéma formaté
npx prisma format

# Valider le schéma
npx prisma validate
```

---

## 🧪 Testing

```bash
# Installer Jest
npm install --save-dev jest supertest

# Lancer les tests
npm test

# Tests en watch mode
npm test -- --watch

# Tests avec couverture
npm test -- --coverage

# Tester un fichier spécifique
npm test -- auth.test.js
```

---

## 🐛 Débogage

```bash
# Lancer en mode debug
node --inspect src/index.js

# Avec rechargement
node --inspect --watch src/index.js

# Afficher les logs détaillés
LOG_LEVEL=debug npm run dev

# Afficher les logs en JSON
LOG_FORMAT=json npm run dev
```

---

## 🔒 Sécurité

```bash
# Générer un JWT_SECRET sécurisé
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Vérifier les vulnérabilités
npm audit

# Corriger les vulnérabilités
npm audit fix

# Vérifier les dépendances mises à jour
npm outdated
```

---

## 📝 Code Quality

```bash
# Installer ESLint
npm install --save-dev eslint

# Lancer ESLint
npx eslint src/

# Fixer automatiquement les erreurs
npx eslint src/ --fix

# Formatter avec Prettier
npm install --save-dev prettier
npx prettier --write src/

# Vérifier les erreurs TypeScript (si utilisé)
npx tsc --noEmit
```

---

## 🌐 API & Testing

```bash
# Tester un endpoint simple
curl http://localhost:3000/

# Tester une requête POST
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'

# Tester avec un token JWT
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Voir les logs des requêtes en détail
curl -v http://localhost:3000/api/users/me
```

---

## 🐳 Docker

```bash
# Construire l'image
docker build -t auth-api .

# Lancer le container
docker run -p 3000:3000 -e NODE_ENV=production auth-api

# Docker Compose
docker-compose up -d

# Arrêter Docker Compose
docker-compose down

# Voir les logs
docker-compose logs -f app
```

---

## 📊 Git

```bash
# Voir le statut
git status

# Ajouter les fichiers
git add .

# Commit avec message
git commit -m "feat: ajouter la 2FA"

# Push vers le repo
git push origin main

# Créer une branche feature
git checkout -b feature/ma-fonctionnalite

# Voir l'historique
git log --oneline -n 10
```

---

## 🚀 Déploiement

### Heroku
```bash
npm install -g heroku-cli
heroku login
heroku create your-app-name
heroku config:set JWT_SECRET="..."
git push heroku main
```

### Railway
```bash
# Connexion via GitHub (plus facile)
# Ajouter des variables d'environnement dans le dashboard
```

### Vercel
```bash
npm install -g vercel
vercel
```

### AWS/EC2
```bash
# SSH vers l'instance
ssh -i key.pem ubuntu@your-ip

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cloner et déployer
git clone <repo>
npm install
npm run db:push
npm start
```

---

## 📧 Email testing

```bash
# Utiliser Mailtrap
# https://mailtrap.io

# Configuration dans .env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_inbox_id
MAIL_PASSWORD=your_token

# Ou utiliser Gmail (voir SETUP_GUIDE.md)
# https://myaccount.google.com/apppasswords
```

---

## 📝 Variables d'environnement

```bash
# Créer le fichier .env
cp .env.example .env

# Éditer le fichier
nano .env       # Linux/Mac
notepad .env    # Windows

# Recharger les env vars
# Redémarrer npm run dev
```

---

## 🔍 Recherche et remplacement

```bash
# Chercher une chaîne dans le code
grep -r "fonction" src/

# Remplacer dans tous les fichiers
grep -r "old" src/ | sed 's/old/new/g'

# Utiliser VS Code
Ctrl+Shift+F  # Recherche globale
Ctrl+H        # Recherche et remplacement
```

---

## 📋 Commandes npm utiles

```bash
# Voir tous les scripts disponibles
npm run

# Nettoyer node_modules
rm -rf node_modules
npm install

# Mettre à jour les dépendances
npm update

# Voir les dépendances instalées
npm list

# Voir les versions des dépendances
npm list --depth=0
```

---

## ⚡ Alias utiles (optionnel)

Ajouter à votre `.bashrc` ou `.zshrc`:

```bash
# Pour Linux/Mac
alias dev="npm run dev"
alias start="npm start"
alias db="npm run db:studio"
alias lint="npx eslint src/"
alias test="npm test"

# Windows PowerShell
New-Item -Path $PROFILE -Type File -Force
# Puis ajouter
Set-Alias -Name dev -Value 'npm run dev'
Set-Alias -Name start -Value 'npm start'
Set-Alias -Name db -Value 'npm run db:studio'
```

Utilisation:
```bash
dev          # npm run dev
db           # npm run db:studio
lint         # npx eslint src/
```

---

## 🐛 Commandes de débogage avancées

```bash
# Voir les processus Node en cours
ps aux | grep node

# Tuer un processus
kill -9 <PID>

# Voir quels ports sont utilisés
lsof -i :3000          # Mac/Linux
netstat -ano | grep :3000  # Windows

# Voir la pile d'appels complet
npm run dev 2>&1 | head -100

# Enregistrer les logs dans un fichier
npm run dev > logs.txt 2>&1

# Voir les logs en temps réel
tail -f logs.txt
```

---

## 🌍 URLs utiles en développement

```
Serveur API:         http://localhost:3000
Health check:        http://localhost:3000/
Prisma Studio:       http://localhost:5555 (après npm run db:studio)
```

---

## ✅ Checklist avant de commiter

```bash
# 1. Vérifier le code
npx eslint src/

# 2. Formater
npx prettier --write src/

# 3. Lancer les tests
npm test

# 4. Tester localement
npm run dev

# 5. Vérifier les logs
LOG_LEVEL=debug npm run dev

# 6. Commiter
git add .
git commit -m "feat: description claire"
git push
```

---

## 🔗 Commandes Prisma en détail

```bash
# Créer une migration sans pusher
npx prisma migrate dev --name init_db

# Voir le SQL généré
npx prisma migrate diff --from-empty --to-schema-datasource prisma/schema.prisma

# Revenir à une migration précédente
npx prisma migrate resolve --rolled-back <migration_name>

# Générer Prisma Client
npx prisma generate

# Formater le schéma
npx prisma format

# Valider le schéma
npx prisma validate

# Voir les erreurs du schéma
npx prisma validate --verbose
```

---

## 💾 Sauvegarde et restauration

```bash
# Exporter la BD SQLite
cp prisma/dev.db prisma/dev.db.backup

# Restaurer
cp prisma/dev.db.backup prisma/dev.db

# Exporter PostgreSQL
pg_dump -U user -d authdb > backup.sql

# Restaurer PostgreSQL
psql -U user -d authdb < backup.sql
```

---

## 🎯 Commandes par situation

### Je dois démarrer rapidement
```bash
npm install && cp .env.example .env && npm run db:push && npm run dev
```

### Je dois déboguer une requête
```bash
LOG_LEVEL=debug npm run dev
curl -v http://localhost:3000/api/users/me -H "Authorization: Bearer TOKEN"
```

### Je dois voir la BD
```bash
npm run db:studio
```

### Je dois déployer
```bash
git add . && git commit -m "fix: bug" && git push origin main
# Puis redéployer sur votre plateforme
```

### Je dois nettoyer tout
```bash
rm -rf node_modules prisma/dev.db
npm install
npm run db:push
npm run dev
```

---

## 📞 Si quelque chose ne fonctionne pas

```bash
# 1. Vérifier Node.js
node --version

# 2. Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# 3. Recréer la BD
npx prisma migrate reset

# 4. Voir les erreurs détaillées
LOG_LEVEL=debug npm run dev

# 5. Vérifier .env
cat .env | grep "^[^#]"

# 6. Voir les logs derniers
npm run dev 2>&1 | tail -50
```

---

**Pro tip:** Marquez cette page en favoris! 🔖

**Dernière mise à jour:** 12 janvier 2026
