import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const setupChatHandlers = (io: Server, socket: Socket) => {
    // Join a channel room
    socket.on('join_channel', async (channelId: string) => {
        socket.join(channelId);
        console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    // Join a conversation room
    socket.on('join_conversation', async (conversationId: string) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    // Send a message
    socket.on('send_message', async (data: { channelId?: string; conversationId?: string; content: string; senderId: string }) => {
        try {
            const { channelId, conversationId, content, senderId } = data;

            if (!channelId && !conversationId) {
                throw new Error('Target (channel or conversation) is required');
            }

            // Save to DB
            const message = await prisma.message.create({
                data: {
                    content,
                    channelId: channelId || undefined,
                    conversationId: conversationId || undefined,
                    senderId,
                    messageType: 'TEXT',
                },
                include: {
                    User: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });

            // Broadcast to room
            const targetRoom = channelId || conversationId;
            if (targetRoom) {
                io.to(targetRoom).emit('receive_message', message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
});

// Mark message as delivered
socket.on('mark_delivered', async (data: { messageId: string; userId: string }) => {
    try {
        const { messageId, userId } = data;
        await prisma.message.update({
            where: { id: messageId },
            data: { status: 'DELIVERED' }
        });

        // Notify sender (we need to find the sender, or just broadcast to the room and let client filter)
        // Better: Broadcast to the conversation room.
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (message && message.conversationId) {
            io.to(message.conversationId).emit('message_status_update', { messageId, status: 'DELIVERED' });
        }
    } catch (error) {
        console.error('Error marking delivered:', error);
    }
});

// Mark message as read
socket.on('mark_read', async (data: { messageId: string; userId: string }) => {
    try {
        const { messageId, userId } = data;
        await prisma.message.update({
            where: { id: messageId },
            data: { status: 'READ' }
        });

        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (message && message.conversationId) {
            io.to(message.conversationId).emit('message_status_update', { messageId, status: 'READ' });
        }
    } catch (error) {
        console.error('Error marking read:', error);
    }
});
};
