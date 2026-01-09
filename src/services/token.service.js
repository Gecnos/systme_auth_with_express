import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import { de } from 'zod/locales';

class TokenService {
    generateAuthTokens = async (user) => {
        const accessTokenExpires = '15m';
        const refreshTokenExpiresDays = 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresDays);

        // 1. Access Token avec un JTI (JWT ID) pour la blacklist
        const accessTokenJti = uuidv4();
        const accessToken = jwt.sign(
            { sub: user.id, jti: accessTokenJti },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: accessTokenExpires }
        );

        // 2. Refresh Token unique
        const refreshToken = uuidv4();

        // 3. Enregistrement en base (Whitelist)
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: expiresAt
            }
        });

        return {
            access: { token: accessToken, jti: accessTokenJti },
            refresh: { token: refreshToken, expiresAt }
        };
    }
}

export default new TokenService();