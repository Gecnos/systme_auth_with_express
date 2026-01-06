const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.enable2FA = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        
        // Générer un secret unique et un QR Code
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'API_Auth', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // Stocker le secret temporairement
        await prisma.user.update({
            where: { id: req.user.id },
            data: { twoFactorSecret: secret }
        });

        res.json({ 
            qrCodeUrl, 
            message: "Scannez le QR Code avec Google Authenticator ou Authy." 
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la génération du 2FA" });
    }
};

// confirmation du 2FA

exports.confirm2FA = async (req, res) => {
    const { code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });

    if (isValid) {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { twoFactorEnabledAt: new Date() }
        });
        return res.json({ message: "2FA activé avec succès !" });
    }

    res.status(400).json({ error: "Code invalide. Réessayez." });
};

// verification au login
exports.verify2FALogin = async (req, res) => {
    const { userId, code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
        return res.status(404).json({ error: "Utilisateur ou configuration introuvable" });
    }

    const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });

    if (isValid) {
        //  fonction de Ferdinande pour générer les JWT
       
        return res.json({ message: "Authentification réussie", tokens: "VOS_JWT_ICI" });
    }

    res.status(401).json({ error: "Code OTP incorrect" });
};