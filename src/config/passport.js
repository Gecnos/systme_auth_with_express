import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      
      // 1. Chercher si le compte OAuth existe déjà
      const oauthAccount = await prisma.oAuthAccount.findUnique({
        where: { provider_providerId: { provider: 'GOOGLE', providerId: profile.id } },
        include: { user: true }
      });

      if (oauthAccount) return done(null, oauthAccount.user);

      // 2. Si non, chercher l'utilisateur par email ou le créer
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email: email || '',
          emailVerifiedAt: new Date(), // Google vérifie  
          oAuthAccounts: {
            create: { provider: 'GOOGLE', providerId: profile.id }
          }
        }
      });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));