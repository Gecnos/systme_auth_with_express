const express = require('express');
const router = express.Router();
const passport = require('passport');
const twoFactor = require('../controllers/2fa.controller');
const { protect } = require('../middlewares/auth.middleware'); // Vianney

// Routes OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
        
        res.json({ message: "Connecté via Google", user: req.user });
    }
);

// Routes 2FA
router.post('/2fa/enable', twoFactor.enable2FA);  // "protect" ici plus tard
router.post('/2fa/confirm', twoFactor.confirm2FA);
router.post('/2fa/verify-login', twoFactor.verify2FALogin);

module.exports = router;