import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    displayName: z.string().min(2).max(100),
    domainId: z.string().uuid()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

// Mock user storage (replace with Prisma later)
const users: any[] = [];

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        // Validate input
        const data = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = users.find(u => u.email === data.email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Create user
        const user = {
            id: Math.random().toString(36).substring(7),
            email: data.email,
            passwordHash,
            displayName: data.displayName,
            domainId: data.domainId,
            createdAt: new Date()
        };

        users.push(user);

        // Generate JWT token
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
                displayName: user.displayName
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
        const user = users.find(u => u.email === data.email);
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
                displayName: user.displayName
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
        const user = users.find(u => u.id === decoded.userId);
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

        const user = users.find(u => u.id === decoded.userId);
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
