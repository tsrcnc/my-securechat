import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware as authenticateToken } from '../middleware/auth.middleware';

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

// Delete a conversation
router.delete('/conversation/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;

        // Verify participation
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId: id,
                    userId
                }
            }
        });

        if (!participant) {
            return res.status(403).json({ error: 'Not a participant' });
        }

        await prisma.conversationParticipant.delete({
            where: {
                conversationId_userId: {
                    conversationId: id,
                    userId
                }
            }
        });

        // Check if any participants left
        const remaining = await prisma.conversationParticipant.count({
            where: { conversationId: id }
        });

        if (remaining === 0) {
            await prisma.conversation.delete({ where: { id } });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// Block a user
router.post('/block', authenticateToken, async (req, res) => {
    try {
        const { blockedId } = req.body;
        const blockerId = (req as any).user.userId;

        await prisma.blockedUser.create({
            data: {
                blockerId,
                blockedId
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
});

// Leave a group
router.post('/group/leave', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.body;
        const userId = (req as any).user.userId;

        await prisma.conversationParticipant.delete({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ error: 'Failed to leave group' });
    }
});

// Remove user from group (Admin only)
router.post('/group/remove', authenticateToken, async (req, res) => {
    try {
        const { conversationId, targetUserId } = req.body;
        const requesterId = (req as any).user.userId;

        // Check if requester is admin
        const requester = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: requesterId
                }
            }
        });

        if (!requester || requester.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can remove participants' });
        }

        await prisma.conversationParticipant.delete({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: targetUserId
                }
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing participant:', error);
        res.status(500).json({ error: 'Failed to remove participant' });
    }
});

export default router;
