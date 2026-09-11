import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Helper to determine base frontend URL
const getFrontendUrl = (req) => {
    let returnTo = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
        if (req.query?.state) {
            const parsed = JSON.parse(Buffer.from(req.query.state, 'base64').toString('utf8'));
            if (parsed.returnTo) {
                returnTo = parsed.returnTo.replace(/\/login.*$/, '');
            }
        }
    } catch (e) {}
    return returnTo;
};

// Google OAuth Routes
router.get('/google', (req, res, next) => {
    const returnTo = req.query.returnTo || req.headers.referer || process.env.FRONTEND_URL || 'http://localhost:3000';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: Buffer.from(JSON.stringify({ returnTo })).toString('base64')
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    const returnTo = getFrontendUrl(req);
    passport.authenticate('google', { failureRedirect: `${returnTo}/login?error=oauth_failed` }, (err, user) => {
        if (err || !user) {
            return res.redirect(`${returnTo}/login?error=oauth_failed`);
        }
        const token = generateToken(user.id);
        return res.redirect(`${returnTo}/login?token=${token}`);
    })(req, res, next);
});

// GitHub OAuth Routes
router.get('/github', (req, res, next) => {
    const returnTo = req.query.returnTo || req.headers.referer || process.env.FRONTEND_URL || 'http://localhost:3000';
    passport.authenticate('github', {
        scope: ['user:email'],
        state: Buffer.from(JSON.stringify({ returnTo })).toString('base64')
    })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
    const returnTo = getFrontendUrl(req);
    passport.authenticate('github', { failureRedirect: `${returnTo}/login?error=oauth_failed` }, (err, user) => {
        if (err || !user) {
            return res.redirect(`${returnTo}/login?error=oauth_failed`);
        }
        const token = generateToken(user.id);
        return res.redirect(`${returnTo}/login?token=${token}`);
    })(req, res, next);
});

export default router;
