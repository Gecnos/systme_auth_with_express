import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Middlewares
import { globalLimiter } from './middlewares/rate-limit.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';

// Config
import passport from './config/passport.js';

// Routes
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import oauth2faRouter from './routes/OAuth&2fa.routes.js';
import emailRoutes from './routes/emailRoutes.js';
import passwordRoutes from './routes/password.routes.js';

const app = express();

// Configuration sécurité
app.use(helmet());
app.use(cors());

// Parsing des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
app.use(globalLimiter);

// Passport
app.use(passport.initialize());

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Système d\'authentification',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      email: '/api/email'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/auth', oauth2faRouter);
app.use('/api/users', userRouter);
app.use('/api/email', emailRoutes);
app.use('/api/password', passwordRoutes);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app. listen(PORT, () => {
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});

export default app;