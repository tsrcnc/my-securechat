import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { verifyDomain, generateVerificationRecord } from '../lib/dns-verification';
import { sendDomainVerificationEmail } from '../lib/email';

const router = Router();

// Validation schemas
const registerDomainSchema = z.object({
    domainName: z.string().min(3).regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
    ownerEmail: z.string().email(),
    companyName: z.string().optional(),
    contactPhone: z.string().optional()
});

const verifyDomainSchema = z.object({
    domainName: z.string().min(3)
});

/**
 * POST /api/domains/register
 * Register a new domain (Admin function)
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const data = registerDomainSchema.parse(req.body);

        // Check if domain already exists
        const existingDomain = await prisma.domain.findUnique({
            where: { domainName: data.domainName }
        });

        if (existingDomain) {
            // If domain exists but is not verified, allow re-registration (resume verification)
            if (existingDomain.verificationStatus === 'PENDING') {
                // If the owner email matches, return success with existing token
                if (existingDomain.ownerEmail === data.ownerEmail) {
                    return res.status(200).json({
                        success: true,
                        message: 'Domain already registered. Resuming verification.',
                        domain: {
                            id: existingDomain.id,
                            domainName: existingDomain.domainName,
                            ownerEmail: existingDomain.ownerEmail,
                            companyName: existingDomain.companyName,
                            verificationToken: existingDomain.verificationToken,
                            verificationStatus: existingDomain.verificationStatus
                        }
                    });
                } else {
                    return res.status(409).json({
                        success: false,
                        message: 'Domain is already registered by another user.'
                    });
                }
            } else {
                return res.status(409).json({
                    success: false,
                    message: 'Domain is already registered and verified.'
                });
            }
        }

        // Generate verification token
        const verificationToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

        // Create domain
        const domain = await prisma.domain.create({
            data: {
                domainName: data.domainName,
                ownerEmail: data.ownerEmail,
                companyName: data.companyName,
                contactPhone: data.contactPhone,
                verificationToken,
                verificationStatus: 'PENDING',
                verificationMethod: 'DNS',
                subscriptionStatus: 'TRIAL', // Free trial for now
                maxUsers: 1000
            }
        });

        // Send verification email
        try {
            await sendDomainVerificationEmail(
                data.ownerEmail,
                data.domainName,
                verificationToken
            );
        } catch (emailError) {
            console.error('Failed to send domain verification email:', emailError);
            // Don't block registration if email fails
        }

        // Log domain registration
        await prisma.auditLog.create({
            data: {
                domainId: domain.id,
                action: 'DOMAIN_REGISTERED',
                resourceType: 'Domain',
                resourceId: domain.id,
                metadata: {
                    domainName: domain.domainName,
                    ownerEmail: data.ownerEmail
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Domain registered successfully! Please check your email for verification instructions.',
            domain: {
                id: domain.id,
                domainName: domain.domainName,
                ownerEmail: domain.ownerEmail,
                companyName: domain.companyName,
                verificationStatus: domain.verificationStatus,
                verificationToken: domain.verificationToken, // Include for testing
                createdAt: domain.createdAt
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }
        console.error('Domain registration error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
});


/**
 * GET /api/domains/:domainName
 * Get domain information and verification status
 */
router.get('/:domainName', async (req: Request, res: Response) => {
    try {
        const { domainName } = req.params;

        const domain = await prisma.domain.findUnique({
            where: { domainName },
            include: {
                _count: {
                    select: { User: true }
                }
            }
        });

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        res.json({
            id: domain.id,
            domainName: domain.domainName,
            verificationStatus: domain.verificationStatus,
            verificationMethod: domain.verificationMethod,
            verifiedAt: domain.verifiedAt,
            ownerEmail: domain.ownerEmail,
            companyName: domain.companyName,
            subscriptionStatus: domain.subscriptionStatus,
            subscriptionEndDate: domain.subscriptionEndDate,
            maxUsers: domain.maxUsers,
            currentUsers: domain._count.User,
            createdAt: domain.createdAt
        });

    } catch (error) {
        console.error('Get domain error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
});

/**
 * GET /api/domains/:domainName/instructions
 * Get DNS verification instructions for domain owner
 */
router.get('/:domainName/instructions', async (req: Request, res: Response) => {
    try {
        const { domainName } = req.params;

        const domain = await prisma.domain.findUnique({
            where: { domainName }
        });

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        const verificationRecord = generateVerificationRecord(
            domain.domainName,
            domain.verificationToken
        );

        res.json({
            domain: domain.domainName,
            status: domain.verificationStatus,
            record: verificationRecord,
            steps: [
                '1. Log in to your domain registrar or DNS provider',
                '2. Navigate to DNS settings or DNS management',
                '3. Add a new TXT record with the details shown above',
                '4. Wait for DNS propagation (usually 1-2 hours, max 24 hours)',
                '5. Click "Verify Now" button to check verification'
            ]
        });

    } catch (error) {
        console.error('Get instructions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/domains/:domainName/verify
 * Trigger DNS verification check
 */
router.post('/:domainName/verify', async (req: Request, res: Response) => {
    try {
        const { domainName } = req.params;

        const domain = await prisma.domain.findUnique({
            where: { domainName }
        });

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        // Don't re-verify already verified domains
        if (domain.verificationStatus === 'VERIFIED') {
            return res.json({
                success: true,
                verified: true,
                message: 'Domain is already verified',
                verifiedAt: domain.verifiedAt
            });
        }

        // Run DNS verification
        const result = await verifyDomain(
            domain.domainName,
            domain.verificationToken,
            domain.verificationMethod
        );

        if (result.verified) {
            // Update domain as verified
            const updatedDomain = await prisma.domain.update({
                where: { id: domain.id },
                data: {
                    verificationStatus: 'VERIFIED',
                    verifiedAt: new Date()
                }
            });

            // Log the verification
            await prisma.auditLog.create({
                data: {
                    domainId: domain.id,
                    action: 'DOMAIN_VERIFIED',
                    resourceType: 'Domain',
                    resourceId: domain.id,
                    metadata: {
                        method: result.method,
                        domainName: domain.domainName
                    }
                }
            });

            return res.json({
                success: true,
                verified: true,
                message: 'Domain verified successfully!',
                verifiedAt: updatedDomain.verifiedAt,
                details: result.details
            });
        } else {
            // Verification failed
            return res.status(400).json({
                success: false,
                verified: false,
                message: 'Domain verification failed',
                details: result.details,
                help: 'Please ensure the DNS TXT record is correctly added and DNS has propagated. DNS changes can take up to 24 hours.'
            });
        }

    } catch (error) {
        console.error('Domain verification error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred during verification. Please try again later.'
        });
    }
});

/**
 * PATCH /api/domains/:domainName
 * Update domain settings (admin only)
 */
router.patch('/:domainName', async (req: Request, res: Response) => {
    try {
        const { domainName } = req.params;
        const { companyName, contactPhone } = req.body;

        const domain = await prisma.domain.findUnique({
            where: { domainName }
        });

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' });
        }

        // TODO: Add authentication middleware to verify user is domain admin
        // For now, allowing updates

        const updatedDomain = await prisma.domain.update({
            where: { id: domain.id },
            data: {
                ...(companyName && { companyName }),
                ...(contactPhone && { contactPhone })
            }
        });

        res.json({
            success: true,
            domain: {
                domainName: updatedDomain.domainName,
                companyName: updatedDomain.companyName,
                contactPhone: updatedDomain.contactPhone
            }
        });

    } catch (error) {
        console.error('Update domain error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /api/domains/:domainId
 * Delete a domain and all associated data (Admin only)
 */
router.delete('/:domainId', async (req: Request, res: Response) => {
    try {
        const { domainId } = req.params;

        // In a real app, we would check if the requester is the domain admin
        // For now, we'll assume the frontend handles the permission check via the token

        // Delete all data associated with the domain
        // Prisma cascade delete should handle most of this if configured, 
        // but explicit deletion is safer for critical operations

        // Fetch all users in the domain to delete their data
        const users = await prisma.user.findMany({
            where: { domainId },
            select: { id: true }
        });
        const userIds = users.map(u => u.id);

        await prisma.$transaction([
            // Delete messages sent by these users
            prisma.message.deleteMany({
                where: {
                    senderId: { in: userIds }
                }
            }),
            // Delete conversations created by these users
            prisma.conversation.deleteMany({
                where: {
                    createdById: { in: userIds }
                }
            }),
            // Delete users
            prisma.user.deleteMany({
                where: { domainId }
            }),
            // Delete subscriptions
            prisma.subscription.deleteMany({
                where: { domainId }
            }),
            // Finally delete the domain
            prisma.domain.delete({
                where: { id: domainId }
            })
        ]);

        await prisma.auditLog.create({
            data: {
                action: 'DOMAIN_DELETED',
                domainId: domainId,
                resourceType: 'DOMAIN',
                resourceId: domainId,
                metadata: { timestamp: new Date() }
            }
        });

        res.json({ success: true, message: 'Domain and all associated data deleted successfully' });
    } catch (error) {
        console.error('Delete domain error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/domains/:domainId/cancel-subscription
 * Cancel domain subscription (Admin only)
 */
router.post('/:domainId/cancel-subscription', async (req: Request, res: Response) => {
    try {
        const { domainId } = req.params;

        const domain = await prisma.domain.update({
            where: { id: domainId },
            data: {
                subscriptionStatus: 'TRIAL',
                subscriptionEndDate: null
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'SUBSCRIPTION_CANCELLED',
                domainId: domainId,
                resourceType: 'SUBSCRIPTION',
                resourceId: domainId,
                metadata: { timestamp: new Date() }
            }
        });

        res.json({ success: true, message: 'Subscription cancelled successfully', domain });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
