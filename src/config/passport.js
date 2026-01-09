import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let oauthAccount = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerId: {
              provider: 'google',
              providerId: profile.id,
            },
          },
          include: { user: true },
        });

        if (oauthAccount) {
          return done(null, oauthAccount.user);
        }

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Email non fourni par Google'));
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          oauthAccount = await prisma.oAuthAccount.create({
            data: {
              provider: 'google',
              providerId: profile.id,
              userId: user.id,
            },
            include: { user: true },
          });
          return done(null, user);
        }

        user = await prisma.user.create({
          data: {
            email,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            emailVerifiedAt: new Date(),
            oAuthAccounts: {
              create: {
                provider: 'google',
                providerId: profile.id,
              },
            },
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;