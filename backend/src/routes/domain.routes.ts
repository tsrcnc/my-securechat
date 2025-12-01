import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { verifyDomain, generateVerificationRecord } from '../lib/dns-verification';

const router = Router();

// Validation schemas
const verifyDomainSchema = z.object({
    domainName: z.string().min(3)
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
                    select: { users: true }
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
            currentUsers: domain._count.users,
            createdAt: domain.createdAt
        });

    } catch (error) {
        console.error('Get domain error:', error);
        res.status(500).json({ error: 'Internal server error' });
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

export default router;
