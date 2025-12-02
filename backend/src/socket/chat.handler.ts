import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const setupChatHandlers = (io: Server, socket: Socket) => {
    // Join a channel room
    socket.on('join_channel', async (channelId: string) => {
        socket.join(channelId);
        console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    // Send a message
    socket.on('send_message', async (data: { channelId: string; content: string; senderId: string }) => {
        try {
            const { channelId, content, senderId } = data;

            // Save to DB
            const message = await prisma.message.create({
                data: {
                    content,
                    channelId,
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
            io.to(channelId).emit('receive_message', message);
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
};
