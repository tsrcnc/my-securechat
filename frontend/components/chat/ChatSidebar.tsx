import { useEffect, useState } from 'react';

interface Channel {
    id: string;
    name: string;
    type: 'PUBLIC' | 'PRIVATE';
}

interface ChatSidebarProps {
    currentUser: any;
    currentChannelId: string;
    onChannelSelect: (channel: Channel) => void;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatSidebar({ currentUser, currentChannelId, onChannelSelect, onLogout, isOpen, onClose }: ChatSidebarProps) {
    const [channels, setChannels] = useState<Channel[]>([]);

    useEffect(() => {
        // Fetch channels
        const fetchChannels = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/channels`);
                if (res.ok) {
                    const data = await res.json();
                    setChannels(data);
                }
            } catch (error) {
                console.error('Failed to fetch channels', error);
            }
        };
        fetchChannels();
    }, []);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-200 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-brand-600 dark:text-brand-400">My SecureChat</h1>
                    <button onClick={onClose} className="md:hidden text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Channels</h2>
                    <div className="space-y-2">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => {
                                    onChannelSelect(channel);
                                    onClose(); // Close sidebar on mobile after selection
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${currentChannelId === channel.id
                                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                # {channel.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-300 font-bold">
                                {currentUser?.displayName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentUser?.displayName}</p>
                            </div>
                        </div>
                        <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
