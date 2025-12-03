'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import ProfileModal from '@/components/chat/ProfileModal';

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

    const [currentConversationId, setCurrentConversationId] = useState<string>('');
    const [currentConversationType, setCurrentConversationType] = useState<'DIRECT' | 'GROUP' | 'CHANNEL' | ''>('');
    const [currentChatName, setCurrentChatName] = useState<string>('');
    const [currentTarget, setCurrentTarget] = useState<any>(null);

    const [messages, setMessages] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [viewingProfile, setViewingProfile] = useState<any>(null);
    const [contacts, setContacts] = useState<any[]>([]);

    // Auth check and fetch user/contacts
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch user profile
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user');
                return res.json();
            })
            .then(data => setUser(data))
            .catch(() => router.push('/login'));

        // Fetch contacts
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setContacts(data.map((c: any) => ({
                        ...c.Contact,
                        nickname: c.nickname
                    })));
                }
            })
            .catch(err => console.error('Failed to fetch contacts', err));

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
            setMessages(prev => {
                // Check if message belongs to current chat
                const isForCurrentChannel = currentConversationType === 'CHANNEL' && message.channelId === currentConversationId;
                const isForCurrentConversation = (currentConversationType === 'DIRECT' || currentConversationType === 'GROUP') && message.conversationId === currentConversationId;

                if (isForCurrentChannel || isForCurrentConversation) {
                    return [...prev, message];
                }
                return prev;
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, currentConversationId, currentConversationType]);

    // Join room and fetch history
    useEffect(() => {
        if (socket && currentConversationId) {
            if (currentConversationType === 'CHANNEL') {
                socket.emit('join_channel', currentConversationId);
            } else {
                socket.emit('join_conversation', currentConversationId);
            }
            fetchHistory(currentConversationId);
        }
    }, [currentConversationId, currentConversationType, socket]);

    const fetchHistory = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch history', error);
        }
    };

    const handleSendMessage = (content: string) => {
        if (!socket || !currentConversationId || !user) return;

        const payload: any = {
            content,
            senderId: user.id
        };

        if (currentConversationType === 'CHANNEL') {
            payload.channelId = currentConversationId;
        } else {
            payload.conversationId = currentConversationId;
        }

        socket.emit('send_message', payload);
    };

    const handleConversationSelect = (id: string, type: 'DIRECT' | 'GROUP' | 'CHANNEL', target: any) => {
        setCurrentConversationId(id);
        setCurrentConversationType(type);
        setCurrentTarget(target);

        if (type === 'CHANNEL') {
            setCurrentChatName(`# ${target.name}`);
        } else if (type === 'GROUP') {
            setCurrentChatName(target.name);
        } else {
            const otherUser = target.ConversationParticipant?.find((p: any) => p.User.id !== user?.id)?.User;
            setCurrentChatName(otherUser?.displayName || 'Chat');
        }
        setIsSidebarOpen(false); // Close sidebar on mobile
    };

    const handleBlockUser = async () => {
        if (!currentTarget || currentConversationType !== 'DIRECT') return;

        const otherUser = currentTarget.ConversationParticipant?.find((p: any) => p.User.id !== user?.id)?.User;
        if (!otherUser) return;

        if (confirm(`Are you sure you want to block ${otherUser.displayName}?`)) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/block`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ blockedId: otherUser.id })
                });
                alert('User blocked');
                // Ideally refresh or redirect
            } catch (error) {
                console.error('Failed to block user', error);
            }
        }
    };

    const handleDeleteChat = async () => {
        if (!currentConversationId) return;
        if (confirm('Are you sure you want to delete this chat? This cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversation/${currentConversationId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentConversationId('');
                setCurrentConversationType('');
                // Refresh list? Sidebar should handle it via socket or refresh
                window.location.reload(); // Simple refresh for MVP
            } catch (error) {
                console.error('Failed to delete chat', error);
            }
        }
    };

    const handleLeaveGroup = async () => {
        if (!currentConversationId || currentConversationType !== 'GROUP') return;
        if (confirm('Are you sure you want to leave this group?')) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/group/leave`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ conversationId: currentConversationId })
                });
                setCurrentConversationId('');
                setCurrentConversationType('');
                window.location.reload();
            } catch (error) {
                console.error('Failed to leave group', error);
            }
        }
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
                currentChannelId={currentConversationId} // Reusing prop name for now
                onChannelSelect={(channel) => handleConversationSelect(channel.id, 'CHANNEL', channel)}
                onConversationSelect={handleConversationSelect}
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
                            {currentConversationType === 'CHANNEL' && <span className="text-2xl text-gray-400 mr-2">#</span>}
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                {currentChatName || 'Select a chat'}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline mr-4">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>

                        {/* Actions Menu */}
                        {currentConversationId && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                if (currentConversationType === 'DIRECT') {
                                                    const otherUser = currentTarget.ConversationParticipant?.find((p: any) => p.User.id !== user?.id)?.User;
                                                    if (otherUser) {
                                                        setViewingProfile(otherUser);
                                                    }
                                                }
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            View Profile
                                        </button>

                                        {currentConversationType === 'DIRECT' && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        if (currentTarget) {
                                                            const otherUser = currentTarget.ConversationParticipant?.find((p: any) => p.User.id !== user?.id)?.User;
                                                            if (otherUser) {
                                                                const isContact = contacts.some(c => c.id === otherUser.id);
                                                                if (!isContact) {
                                                                    const token = localStorage.getItem('token');
                                                                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/add`, {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                                                        body: JSON.stringify({ email: otherUser.email })
                                                                    })
                                                                        .then(res => res.json())
                                                                        .then(data => {
                                                                            if (data.error) alert(data.error);
                                                                            else {
                                                                                alert('Contact added successfully');
                                                                                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
                                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                                })
                                                                                    .then(res => res.json())
                                                                                    .then(data => {
                                                                                        if (Array.isArray(data)) {
                                                                                            setContacts(data.map((c: any) => ({
                                                                                                ...c.Contact,
                                                                                                nickname: c.nickname
                                                                                            })));
                                                                                        }
                                                                                    });
                                                                            }
                                                                        })
                                                                        .catch(err => console.error(err));
                                                                } else {
                                                                    setViewingProfile(otherUser);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    {(() => {
                                                        const otherUser = currentTarget?.ConversationParticipant?.find((p: any) => p.User.id !== user?.id)?.User;
                                                        const isContact = otherUser && contacts.some(c => c.id === otherUser.id);
                                                        return isContact ? 'Edit Contact' : 'Add to Contacts';
                                                    })()}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        handleBlockUser();
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    Block User
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleDeleteChat();
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Delete Chat
                                        </button>

                                        {currentConversationType === 'GROUP' && (
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    handleLeaveGroup();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Leave Group
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {currentConversationId ? (
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
                        <p className="text-sm mt-2">Select a contact or group to start chatting.</p>
                    </div>
                )}
            </div>

            <ProfileModal
                isOpen={!!viewingProfile}
                onClose={() => setViewingProfile(null)}
                user={viewingProfile}
                isContact={viewingProfile && contacts.some(c => c.id === viewingProfile.id)}
                onMessage={() => setViewingProfile(null)}
            />
        </div>
    );
}
