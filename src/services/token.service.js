import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';

class TokenService {
    generateAuthTokens = async (user) => {
        const accessTokenExpires = process.env.JWT_EXPIRES_IN || '1h';
        const refreshTokenExpiresDays = 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresDays);

        // 1. Generate Refresh Token unique
        const refreshTokenValue = uuidv4();

        // 2. Enregistrement en base (Whitelist)
        const refreshTokenEntry = await prisma.refreshToken.create({
            data: {
                token: refreshTokenValue,
                userId: user.id,
                expiresAt: expiresAt
            }
        });

        // 3. Access Token avec un JTI (JWT ID) et sessionId (RefreshToken ID)
        const accessTokenJti = uuidv4();
        const accessToken = jwt.sign(
            {
                sub: user.id,
                jti: accessTokenJti,
                sessionId: refreshTokenEntry.id
            },
            process.env.JWT_SECRET,
            { expiresIn: accessTokenExpires }
        );

        return {
            access: { token: accessToken, jti: accessTokenJti },
            refresh: { token: refreshTokenValue, expiresAt }
        };
    }
}

export default new TokenService();
