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
            // Check if conversation already exists
            const existingConversation = await prisma.conversation.findFirst({
                where: {
                    type: 'DIRECT',
                    AND: [
                        { ConversationParticipant: { some: { userId } } },
                        { ConversationParticipant: { some: { userId: participantId } } }
                    ]
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

            if (existingConversation) {
                return res.json(existingConversation);
            }

            // Check if a conversation exists where the OTHER user is a participant, but I am not (deleted case)
            // This is a bit complex with Prisma. Let's try to find any DIRECT conversation with the other user
            // and see if I was previously part of it or just re-create.
            // Actually, if I deleted it, I am removed from participants.
            // So we need to find a conversation where the OTHER user is a participant, and it is a DIRECT chat,
            // and check if it *was* with me. But we don't store "past participants".
            // So, if I deleted it, for all intents and purposes, it's gone for me.
            // But if the OTHER user sends a message, they will use the OLD conversation ID.
            // If I start a NEW chat, I should probably check if there is an existing conversation that the OTHER user has
            // which effectively is a DM with me.
            // Since we don't have a unique constraint on DMs yet, we might have multiple DMs.
            // Let's enforce: Try to find a conversation where participantId is a member, and it's DIRECT.
            // Then check if I am *not* a member.
            // But how do we know it was with ME?
            // We need to look at the messages or we need to never fully delete the participant row, just mark as "deleted".
            // OR, we just create a new one.

            // BETTER APPROACH for "Resurrection" when receiving a message:
            // The sender uses `socket.emit('send_message')`. The socket handler should check if recipient is part of conversation.
            // If not, re-add them.

            // For this `create` endpoint (Starting a chat from UI):
            // If I try to start a chat with someone I deleted, I should just create a new one OR find the one they might still have active.
            // Finding the one they have active is hard without a "participants" history.

            // Let's try to find ANY Direct conversation where the other user is a participant.
            // And then check if that conversation *would* be with me.
            // Since we don't store "intended participants" on the Conversation model, only in the join table,
            // if I leave, there is no record I was there.

            // FIX: When "deleting" a chat, don't remove the participant row. Add a `deletedAt` or `hidden` flag.
            // But I don't have that column yet.
            // Alternative: When creating, check if there is a conversation with the other user that has ONLY 1 participant (them).
            // This implies the other person (me) left.

            // Improved Resurrection Logic:
            // Find a conversation where the other user is a participant, I am NOT a participant,
            // AND I have sent a message in it previously. This confirms it was a chat with me.
            const potentialResurrection = await prisma.conversation.findFirst({
                where: {
                    type: 'DIRECT',
                    ConversationParticipant: {
                        some: { userId: participantId }
                    },
                    Message: {
                        some: { senderId: userId } // I sent a message
                    }
                },
                include: {
                    ConversationParticipant: true
                }
            });

            // If found, and I am not currently a participant (double check)
            if (potentialResurrection) {
                const amIParticipant = potentialResurrection.ConversationParticipant.some(p => p.userId === userId);
                if (!amIParticipant) {
                    // Resurrect! Re-add me.
                    await prisma.conversationParticipant.create({
                        data: {
                            conversationId: potentialResurrection.id,
                            userId,
                            role: 'MEMBER'
                        }
                    });

                    // Return updated conversation
                    const updated = await prisma.conversation.findUnique({
                        where: { id: potentialResurrection.id },
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
                    return res.json(updated);
                }
            }

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
