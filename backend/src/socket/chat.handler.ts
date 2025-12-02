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
};
