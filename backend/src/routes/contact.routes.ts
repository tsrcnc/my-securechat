import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware as authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Add contact by email
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { email, nickname } = req.body;
        const userId = (req as any).user.userId;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        const contactUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!contactUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (contactUser.id === userId) {
            return res.status(400).json({ error: 'Cannot add yourself as a contact' });
        }

        // Check if already exists
        const existingContact = await prisma.contact.findUnique({
            where: {
                userId_contactId: {
                    userId,
                    contactId: contactUser.id
                }
            }
        });

        if (existingContact) {
            return res.status(400).json({ error: 'User is already in your contacts' });
        }

        // Add contact
        const contact = await prisma.contact.create({
            data: {
                userId,
                contactId: contactUser.id,
                nickname: nickname || contactUser.displayName
            },
            include: {
                Contact: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatarUrl: true,
                        status: true,
                        lastSeen: true
                    }
                }
            }
        });

        res.json(contact);
    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).json({ error: 'Failed to add contact' });
    }
});

// Get contacts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = (req as any).user.userId;

        const contacts = await prisma.contact.findMany({
            where: { userId },
            include: {
                Contact: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true,
                        avatarUrl: true,
                        status: true,
                        lastSeen: true
                    }
                }
            },
            orderBy: {
                nickname: 'asc'
            }
        });

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Update contact nickname
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { contactId, nickname } = req.body;
        const userId = (req as any).user.userId;

        if (!contactId) {
            return res.status(400).json({ error: 'Contact ID is required' });
        }

        // Update contact
        const contact = await prisma.contact.updateMany({
            where: {
                userId: userId,
                contactId: contactId
            },
            data: {
                nickname: nickname
            }
        });

        if (contact.count === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

export default router;
