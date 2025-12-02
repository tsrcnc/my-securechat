import { useEffect, useRef } from 'react';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    User?: {
        displayName: string;
    };
}

interface MessageListProps {
    messages: Message[];
    currentUser: any;
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            ) : (
                messages.map((msg) => {
                    const isOwn = msg.senderId === currentUser?.id;
                    const senderName = msg.User?.displayName || 'Unknown';

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-4 py-3 shadow-sm ${isOwn
                                ? 'bg-brand-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
                                }`}>
                                {!isOwn && (
                                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                                        {senderName}
                                    </p>
                                )}
                                <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-brand-100' : 'text-gray-400'
                                    }`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
