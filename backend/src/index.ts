import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import domainRoutes from './routes/domain.routes';
import chatRoutes from './routes/chat.routes';
import contactRoutes from './routes/contact.routes';
import { setupChatHandlers } from './socket/chat.handler';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
        credentials: true
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'My SecureChat API is running' });
});

// API Routes
app.get('/api', (req, res) => {
    res.json({
        message: 'My SecureChat API',
        version: '0.1.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            domains: '/api/domains',
            chat: '/api/chat',
            contacts: '/api/contacts',
            messages: '/api/messages'
        }
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contacts', contactRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Initialize chat handlers
    setupChatHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    socket.on('message', (data) => {
        console.log('Message received:', data);
        // Broadcast message to all connected clients
        io.emit('message', data);
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO server ready`);
    console.log(`🔐 Auth routes: /api/auth`);
});

export { app, io };
