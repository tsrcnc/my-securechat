import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all channels (for now, just public ones)
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

// Get chat history for a channel
router.get('/history/:channelId', async (req, res) => {
    try {
        const { channelId } = req.params;
        const messages = await prisma.message.findMany({
            where: { channelId },
            include: {
                User: {
                    select: { id: true, displayName: true, avatarUrl: true }
                }
            },
            orderBy: { createdAt: 'asc' }, // Oldest first
            take: 50 // Limit to last 50 for now
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
