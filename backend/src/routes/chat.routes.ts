import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Create or get conversation (DM)
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { participantId, type, name } = req.body;
        const userId = (req as any).user.userId;

        if (type === 'DIRECT') {
            // Simple check: Create new DM
            // In production, we should check if one exists.
            // For this MVP, we'll create a new one or return if we can find it easily.

            const conversation = await prisma.conversation.create({
                data: {
                    type: 'DIRECT',
                    ConversationParticipant: {
                        create: [
                            { userId, role: 'MEMBER' },
                            { userId: participantId, role: 'MEMBER' }
                        ]
                    }
                },
                include: {
                    ConversationParticipant: {
                        include: {
                            User: {
                                select: { id: true, displayName: true, avatarUrl: true, email: true }
                            }
                        }
                    }
                }
            });
            return res.json(conversation);
        } else if (type === 'GROUP') {
            const conversation = await prisma.conversation.create({
                data: {
                    type: 'GROUP',
                    name,
                    ConversationParticipant: {
                        create: [
                            { userId, role: 'ADMIN' }
                        ]
                    }
                },
                include: {
                    ConversationParticipant: {
                        include: {
                            User: {
                                select: { id: true, displayName: true, avatarUrl: true }
                            }
                        }
                    }
                }
            });
            return res.json(conversation);
        }
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get my conversations
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const conversations = await prisma.conversation.findMany({
            where: {
                ConversationParticipant: {
                    some: { userId }
                }
            },
            include: {
                ConversationParticipant: {
                    include: {
                        User: {
                            select: { id: true, displayName: true, avatarUrl: true, email: true }
                        }
                    }
                },
                Message: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get chat history for a conversation (DM/Group)
router.get('/history/:conversationId', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                User: {
                    select: { id: true, displayName: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: 50
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Keep channel routes for now but they might be deprecated
router.get('/channels', async (req, res) => {
    try {
        const channels = await prisma.channel.findMany({
            where: { type: 'PUBLIC' },
            orderBy: { createdAt: 'asc' }
        });
        res.json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ error: 'Failed to fetch channels' });
    }
});

export default router;
