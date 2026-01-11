import asyncHandler from "../lib/async-handler.js";
import prisma from '../lib/prisma.js';
import tokenService from "../services/token.service.js";
import * as argon from "argon2"
import jwt from 'jsonwebtoken';

class AuthController {
    signup = asyncHandler(async (req, res, next) => {
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

    signin = asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            return next(new Error("Please provide email and password"));
        }

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return next(new Error("Invalid email or password"));
        }

        // Verify password
        const isValid = await argon.verify(user.password, password);
        if (!isValid) {
            return next(new Error("Invalid email or password"));
        }

        // Generate tokens
        const tokens = await tokenService.generateAuthTokens(user);

        // Set refresh token in cookies
        res.cookie('refreshToken', tokens.refresh.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: tokens.refresh.expiresAt
        });

        res.status(200).json({
            status: "success",
            data: {
                user,
                accessToken: tokens.access.token
            }
        });
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

        if (!tokenData || tokenData.revokedAt || tokenData.expiresAt < new Date()) {
            res.clearCookie('refreshToken');
            return next(new Error("Invalid or expired refresh token"));
        }

        // Generate new tokens
        const tokens = await tokenService.generateAuthTokens(tokenData.user);

        // Revoke the old refresh token
        await prisma.refreshToken.update({
            where: { id: tokenData.id },
            data: { revokedAt: new Date() }
        });

        // Set new refresh token in cookies
        res.cookie('refreshToken', tokens.refresh.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: tokens.refresh.expiresAt
        });

        res.status(200).json({
            status: "success",
            data: {
                accessToken: tokens.access.token
            }
        });
    })

    logout = asyncHandler(async (req, res) => {
        try {
            const accessToken = req.token;
            const userId = req.user.sub;
            const sessionId = req.user.sessionId;

            // 1. Révoker le Refresh Token
            if (sessionId) {
                await prisma.refreshToken.updateMany({
                    where: { id: sessionId, userId },
                    data: { revokedAt: new Date() }
                });
            }

            // 2. Ajouter l'Access Token à la Blacklist
            const decoded = jwt.decode(accessToken);
            await prisma.blacklistedAccessToken.create({
                data: {
                    token: accessToken,
                    userId: userId,
                    expiresAt: new Date(decoded.exp * 1000)
                }
            });

            // 3. Effacer le cookie
            res.clearCookie('refreshToken');

            res.status(200).json({ message: "Déconnexion réussie" });
        } catch (error) {
            console.log("error", error)
            res.status(500).json({ message: "Erreur lors de la déconnexion" });
        }
    })
}
export default new AuthController();
