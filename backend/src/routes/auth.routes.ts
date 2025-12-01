import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(2).max(100),
    // domainId is optional for now, or we can auto-create a domain based on email
    // For this phase, let's assume we are just creating a user and linking to a default domain or null if schema allows
    // Looking at schema, domainId is required. 
    // For now, we will create a dummy domain if it doesn't exist or handle it.
    // BUT, the UI sends domainId? No, the UI sends email/password/displayName.
    // Let's check the schema again. User model has `domainId String`.
    // We need to handle domain creation or assignment.
    // For simplicity in Phase 2, let's create a default domain for the user or allow null if we change schema.
    // Schema says: domainId String (Required).
    // So we MUST have a domain.
    // Let's auto-create a domain based on the email domain part (e.g. user@tsrcnc.com -> tsrcnc.com)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        // Validate input
        const data = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Extract domain from email
        const domainName = data.email.split('@')[1];

        // Find or create domain
        let domain = await prisma.domain.findUnique({
            where: { domainName }
        });

        if (!domain) {
            // Create new domain
            domain = await prisma.domain.create({
                data: {
                    domainName,
                    verificationToken: Math.random().toString(36).substring(7), // Simple token
                    ownerEmail: data.email,
                    verificationStatus: 'PENDING'
                }
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                displayName: data.displayName,
                domainId: domain.id,
                status: 'ONLINE'
            }
        });

        // Generate tokens
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_ACCESS_SECRET || 'secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET || 'refresh-secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                domainId: user.domainId
            },
            token,
            refreshToken
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        // Validate input
        const data = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_ACCESS_SECRET || 'secret',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET || 'refresh-secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                domainId: user.domainId
            },
            token,
            refreshToken
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'refresh-secret'
        ) as any;

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Generate new access token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_ACCESS_SECRET || 'secret',
            { expiresIn: '15m' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

/**
 * GET /api/auth/me
 * Get current user (protected route)
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET || 'secret'
        ) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            domainId: user.domainId
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

export default router;
