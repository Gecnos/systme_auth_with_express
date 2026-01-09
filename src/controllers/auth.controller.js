import asyncHandler from "#lib/async-handler";
import prisma from '../lib/prisma.js';
import * as argon from "argon2"

class AuthController {
    signup = asyncHandler(async (req, res, next)=>{
        const { email, password, firstName, lastName } = req.body;
        // Validate email
        if (!email) {
            return next(new Error("Please provide email"));
        }
        // Validate password
        if (!password) {
            return next(new Error("Please provide password"));
        }

        const hashPwd = await argon.hash(password)
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next(new Error("User already exists"));
        }
        // Create new user
        const newUser = await prisma.user.create({ data: { email, password: hashPwd, lastName, firstName } });
        // Send response
        res.status(201).json({
            status: "success",
            data: {
                user: newUser
            }
        });
    })

    signin = asyncHandler(async (req, res) => {
      const { refreshToken } = req.cookies; 
    
      if (!refreshToken) return res.status(401).send("Session expirée");
    
      // Trouver le token en DB
      const savedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });
    
      // DETECTION DE VOL / REUTILISATION :
      // Si le token n'existe pas ou est déjà marqué comme révoqué
      if (!savedToken || savedToken.revoked) {
        if (savedToken) {
          // Quelqu'un réutilise un token déjà utilisé ! 
          // On révoque TOUS les tokens de cet utilisateur par précaution.
          await prisma.refreshToken.deleteMany({ where: { userId: savedToken.userId } });
        }
        return res.status(403).send("Tentative de réutilisation détectée");
      }
    
      // Vérifier expiration
      if (new Date() > savedToken.expiresAt) {
        await prisma.refreshToken.delete({ where: { id: savedToken.id } });
        return res.status(401).send("Refresh token expiré");
      }
    
      // --- ROTATION EFFECTIVE ---
      
      // 1. Invalider l'ancien token
      await prisma.refreshToken.delete({ where: { id: savedToken.id } });
    
      // 2. Générer le nouveau duo
      const tokens = await generateAuthTokens(savedToken.user);
    
      // 3. Envoyer les nouveaux tokens (Cookie + JSON)
      res.cookie('refreshToken', tokens.refresh.token, { httpOnly: true, secure: true });
      res.json({ accessToken: tokens.access.token, refreshToken: tokens.refresh.token });
    })

    refreshTokens = asyncHandler(async (req, res, next) => {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return next(new Error("No refresh token provided"));
        }

        // Validate refresh token
        const tokenData = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!tokenData || tokenData.revoked) {
            return next(new Error("Invalid or expired refresh token"));
        }

        // Generate new tokens
        const tokens = await generateAuthTokens(tokenData.user);

        // Set new refresh token in cookies
        res.cookie('refreshToken', tokens.refresh.token, { httpOnly: true, secure: true });

        res.status(200).json({
            status: "success",
            data: {
                accessToken: tokens.access.token
            }
        });
    })

    logout = asyncHandler(async (req, res) => {
      try {
        const { refreshToken } = req.cookies;
        const accessToken = req.token; // Récupéré depuis le middleware 'protect'
        const userId = req.user.id;
    
        // 1. Invalider le Refresh Token (Suppression ou marquage)
        if (refreshToken) {
          await prisma.refreshToken.deleteMany({
            where: { token: refreshToken }
          });
        }
    
        // 2. Ajouter l'Access Token à la Blacklist
        // On récupère l'expiration du token pour savoir quand le supprimer de la blacklist
        const decoded = jwt.decode(accessToken);
        
        await prisma.blacklistedAccessToken.create({
          data: {
            token: accessToken,
            userId: userId,
            expiresAt: new Date(decoded.exp * 1000)
          }
        });
    
        res.clearCookie('refreshToken');
        res.status(200).json({ message: "Déconnexion réussie" });
      } catch (error) {
        res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
    })
}
export default new AuthController();