'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';

interface User {
    id: string;
    email: string;
    displayName: string;
    isDomainAdmin: boolean;
}

interface Channel {
    id: string;
    name: string;
    type: 'PUBLIC' | 'PRIVATE';
}

export default function ChatPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentChannelId, setCurrentChannelId] = useState<string>('');
    const [currentChannelName, setCurrentChannelName] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Auth check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [router]);

    // Socket connection
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('token');
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            setIsConnected(false);
        });

        newSocket.on('receive_message', (message: any) => {
            // Only add if it belongs to current channel
            // We need to use a functional update to access the latest currentChannelId if we didn't include it in dependency
            // But here we can just check against the state if we include it in dependency or use a ref.
            // However, including currentChannelId in dependency causes re-connection.
            // Better to check inside the callback or rely on server to only send to joined room.
            // Since we join rooms, we should only receive messages for joined rooms.
            // But if we are joined to multiple, we need to filter.
            // For now, let's trust the server room logic, but filtering is safer.
            setMessages(prev => {
                if (message.channelId === currentChannelId) {
                    return [...prev, message];
                }
                return prev; // Or maybe show a notification for other channels?
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Join channel and fetch history when selected
    useEffect(() => {
        if (socket && currentChannelId) {
            socket.emit('join_channel', currentChannelId);
            fetchHistory(currentChannelId);
        }
    }, [currentChannelId, socket]);

    const fetchHistory = async (channelId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history/${channelId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch history', error);
        }
    };

    const handleSendMessage = (content: string) => {
        if (!socket || !currentChannelId || !user) return;

        socket.emit('send_message', {
            channelId: currentChannelId,
            content,
            senderId: user.id
        });
    };

    const handleChannelSelect = (channel: Channel) => {
        setCurrentChannelId(channel.id);
        setCurrentChannelName(channel.name);
    };

    const handleLogout = () => {
        if (socket) socket.disconnect();
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <ChatSidebar
                currentUser={user}
                currentChannelId={currentChannelId}
                onChannelSelect={handleChannelSelect}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-full w-full relative">
                {/* Header */}
                <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shadow-sm z-10">
                    <div className="flex items-center">
                        <button
                            className="md:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex items-center">
                            <span className="text-2xl text-gray-400 mr-2">#</span>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                {currentChannelName || 'Select a channel'}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                {currentChannelId ? (
                    <>
                        <MessageList messages={messages} currentUser={user} />
                        <ChatInput onSendMessage={handleSendMessage} disabled={!isConnected} />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        <p className="text-lg font-medium">Welcome to My SecureChat</p>
                        <p className="text-sm mt-2">Select a channel from the sidebar to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
