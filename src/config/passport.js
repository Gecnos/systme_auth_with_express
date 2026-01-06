const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // 1. Vérifier si un compte Google est déjà lié
      let oauthAccount = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerId: { provider: 'GOOGLE', providerId: profile.id }
        },
        include: { user: true }
      });

      if (oauthAccount) return done(null, oauthAccount.user);

      // 2. Sinon, lier à un utilisateur existant ou en créer un nouveau
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email: email,
          emailVerifiedAt: new Date(), // Google certifie l'email
          oAuthAccounts: {
            create: { provider: 'GOOGLE', providerId: profile.id }
          }
        }
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));