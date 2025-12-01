import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired } from '../lib/otp';
import { sendOTPEmail, sendDomainVerificationEmail } from '../lib/email';

const router = Router();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
});

const verifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    password: z.string().min(8),
    displayName: z.string().min(2).max(100),
});

const resendOtpSchema = z.object({
    email: z.string().email(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

/**
 * POST /api/auth/register
 * Step 1: Initiate registration by sending OTP
 */
router.post('/register', async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Extract domain from email and validate
        const domainName = data.email.split('@')[1];
        const domain = await prisma.domain.findUnique({
            where: { domainName }
        });

        if (!domain) {
            return res.status(403).json({
                error: 'Domain not registered',
                message: `The domain '${domainName}' is not registered with My SecureChat. Please contact your company administrator to register your domain first.`,
                domain: domainName
            });
        }

        if (domain.verificationStatus !== 'VERIFIED') {
            return res.status(403).json({
                error: 'Domain not verified',
                message: `The domain '${domainName}' is registered but not yet verified. Please ask your administrator to complete domain verification.`,
                domain: domainName,
                status: domain.verificationStatus
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);
        const expiresAt = getOTPExpiry();

        // Store OTP in database (upsert to handle multiple requests)
        // First delete any existing OTPs for this email to keep it clean
        await prisma.emailVerification.deleteMany({
            where: { email: data.email }
        });

        await prisma.emailVerification.create({
            data: {
                email: data.email,
                otpHash,
                expiresAt
            }
        });

        // Send OTP via email
        await sendOTPEmail(data.email, otp);

        res.json({
            message: 'Verification code sent to email',
            email: data.email
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
 * POST /api/auth/verify-otp
 * Step 2: Verify OTP and create account
 */
router.post('/verify-otp', async (req, res) => {
    try {
        const data = verifyOtpSchema.parse(req.body);

        // Find OTP record
        const verification = await prisma.emailVerification.findFirst({
            where: { email: data.email },
            orderBy: { createdAt: 'desc' }
        });

        if (!verification) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        // Check expiry
        if (isOTPExpired(verification.expiresAt)) {
            return res.status(400).json({ error: 'Verification code expired' });
        }

        // Verify OTP
        const isValid = await verifyOTP(data.otp, verification.otpHash);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Check if user exists (double check)
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // --- Account Creation Logic ---

        // Extract domain from email
        const domainName = data.email.split('@')[1];

        // Find domain (must exist and be verified)
        const domain = await prisma.domain.findUnique({
            where: { domainName }
        });

        if (!domain) {
            return res.status(403).json({
                error: 'Domain not registered',
                message: 'Domain must be registered before creating user accounts.'
            });
        }


        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Check if this is the first user from this domain
        const existingUsersCount = await prisma.user.count({
            where: { domainId: domain.id }
        });
        const isFirstUser = existingUsersCount === 0;

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                displayName: data.displayName,
                domainId: domain.id,
                status: 'ONLINE',
                emailVerified: true, // Verified via OTP
                isDomainAdmin: isFirstUser // First user becomes domain admin
            }
        });

        // Delete used OTP
        await prisma.emailVerification.delete({
            where: { id: verification.id }
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
            message: 'Account created successfully',
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
        console.error('OTP Verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/auth/resend-otp
 * Resend verification code
 */
router.post('/resend-otp', async (req, res) => {
    try {
        const data = resendOtpSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);
        const expiresAt = getOTPExpiry();

        // Delete old OTPs
        await prisma.emailVerification.deleteMany({
            where: { email: data.email }
        });

        // Create new OTP
        await prisma.emailVerification.create({
            data: {
                email: data.email,
                otpHash,
                expiresAt
            }
        });

        // Send email
        await sendOTPEmail(data.email, otp);

        res.json({ message: 'Verification code resent' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Resend OTP error:', error);
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
                domainId: user.domainId,
                isDomainAdmin: user.isDomainAdmin
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
            domainId: user.domainId,
            isDomainAdmin: user.isDomainAdmin
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

export default router;
