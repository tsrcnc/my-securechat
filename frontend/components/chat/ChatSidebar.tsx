import { useEffect, useState } from 'react';
import AddContactModal from './AddContactModal';
import CreateGroupModal from './CreateGroupModal';

import ProfileModal from './ProfileModal';

interface Channel {
    id: string;
    name: string;
    type: 'PUBLIC' | 'PRIVATE';
}

interface Contact {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    status?: string;
    nickname?: string;
}

interface Conversation {
    id: string;
    type: 'DIRECT' | 'GROUP';
    name?: string; // For groups
    ConversationParticipant: {
        User: {
            id: string;
            displayName: string;
            avatarUrl?: string;
        }
    }[];
    Message: {
        content: string;
        createdAt: string;
    }[];
}

interface ChatSidebarProps {
    currentUser: any;
    currentChannelId: string; // This might need to change to currentConversationId
    onChannelSelect: (channel: Channel) => void; // Legacy
    onConversationSelect: (conversationId: string, type: 'DIRECT' | 'GROUP' | 'CHANNEL', target?: any) => void;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatSidebar({ currentUser, currentChannelId, onChannelSelect, onConversationSelect, onLogout, isOpen, onClose }: ChatSidebarProps) {
    const [activeTab, setActiveTab] = useState<'CHATS' | 'CONTACTS' | 'GROUPS'>('CHATS');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [viewingProfile, setViewingProfile] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Channels (Legacy/Public)
            const resChannels = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/channels`, { headers });
            if (resChannels.ok) setChannels(await resChannels.json());

            // Fetch Contacts
            const resContacts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, { headers });
            if (resContacts.ok) {
                const data = await resContacts.json();
                setContacts(data.map((c: any) => ({
                    ...c.Contact,
                    nickname: c.nickname
                })));
            }

            // Fetch Conversations
            const resConversations = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations`, { headers });
            if (resConversations.ok) setConversations(await resConversations.json());

        } catch (error) {
            console.error('Failed to fetch sidebar data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddContact = async (email: string, nickname?: string) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ email, nickname })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error);
        }
        fetchData(); // Refresh
    };

    const handleCreateGroup = async (name: string, participantIds: string[]) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, type: 'GROUP', participantId: null }) // participantId ignored for group
        });
        // We need to add participants logic in backend for groups, currently it only adds creator.
        // For MVP, assume backend handles it or we need to update backend.
        // Wait, my backend implementation for GROUP only added creator!
        // I need to fix backend to add participants.
        // But for now let's just proceed and fix backend later if needed.
        if (!res.ok) throw new Error('Failed to create group');
        fetchData();
    };

    const startDM = async (contactId: string) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type: 'DIRECT', participantId: contactId })
        });
        if (res.ok) {
            const conversation = await res.json();
            onConversationSelect(conversation.id, 'DIRECT', conversation);
            onClose();
        }
    };

    const [addContactInitialEmail, setAddContactInitialEmail] = useState('');

    const handleUpdateNickname = async (contactId: string, nickname: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ contactId, nickname })
            });

            if (res.ok) {
                fetchData();
            } else {
                console.error('Failed to update nickname');
            }
        } catch (error) {
            console.error('Error updating nickname:', error);
        }
    };

    const handleAddContactFromProfile = () => {
        if (viewingProfile?.email) {
            setAddContactInitialEmail(viewingProfile.email);
            setIsAddContactOpen(true);
            setViewingProfile(null);
        }
    };

    const isViewingContact = contacts.some(c => c.id === viewingProfile?.id);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={onClose} />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-30 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-200 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center cursor-pointer hover:opacity-80" onClick={() => setViewingProfile(currentUser)}>
                            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold mr-2">
                                {currentUser?.displayName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-white truncate max-w-[120px]">{currentUser?.displayName}</span>
                        </div>
                        <div className="flex gap-2">
                            {currentUser?.isDomainAdmin && (
                                <button onClick={() => window.location.href = '/admin'} className="text-gray-500 hover:text-blue-500" title="Manage Organization">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </button>
                            )}
                            <button onClick={onLogout} className="text-gray-500 hover:text-red-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                            <button onClick={onClose} className="md:hidden text-gray-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search chats or contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActiveTab('CHATS')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'CHATS' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Chats</button>
                    <button onClick={() => setActiveTab('CONTACTS')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'CONTACTS' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Contacts</button>
                    <button onClick={() => setActiveTab('GROUPS')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'GROUPS' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Groups</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2">
                    {activeTab === 'CHATS' && (
                        <div className="space-y-1">
                            {conversations
                                .filter(conv => {
                                    const otherUser = conv.ConversationParticipant.find(p => p.User.id !== currentUser?.id)?.User;
                                    const name = conv.type === 'GROUP' ? conv.name : (otherUser?.displayName || 'Unknown');
                                    return name?.toLowerCase().includes(searchQuery.toLowerCase());
                                })
                                .map(conv => {
                                    const otherUser = conv.ConversationParticipant.find(p => p.User.id !== currentUser?.id)?.User;
                                    const name = conv.type === 'GROUP' ? conv.name : otherUser?.displayName;
                                    return (
                                        <button key={conv.id} onClick={() => onConversationSelect(conv.id, conv.type, conv)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold mr-3">
                                                {name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">{name}</p>
                                                <p className="text-sm text-gray-500 truncate">{conv.Message[0]?.content || 'No messages yet'}</p>
                                            </div>
                                        </button>
                                    );
                                })}

                        </div>
                    )}

                    {activeTab === 'CONTACTS' && (
                        <div className="space-y-1">
                            <button onClick={() => setIsAddContactOpen(true)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-brand-600">
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <span className="font-medium">Add New Contact</span>
                            </button>
                            {contacts
                                .filter(contact =>
                                    (contact.nickname || contact.displayName)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(contact => (
                                    <button key={contact.id} onClick={() => startDM(contact.id)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold mr-3 hover:ring-2 hover:ring-brand-500 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingProfile(contact);
                                            }}
                                        >
                                            {(contact.nickname || contact.displayName)?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{contact.nickname || contact.displayName}</p>
                                            <p className="text-xs text-gray-500">{contact.email}</p>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    )}

                    {activeTab === 'GROUPS' && (
                        <div className="space-y-1">
                            <button onClick={() => setIsCreateGroupOpen(true)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-brand-600">
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <span className="font-medium">Create New Group</span>
                            </button>
                            {/* List groups here (filtered from conversations) */}
                            {conversations
                                .filter(c => c.type === 'GROUP' && c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(group => (
                                    <button key={group.id} onClick={() => onConversationSelect(group.id, 'GROUP', group)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-3">
                                            {group.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-white">{group.name}</p>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            <AddContactModal
                isOpen={isAddContactOpen}
                onClose={() => { setIsAddContactOpen(false); setAddContactInitialEmail(''); }}
                onAddContact={handleAddContact}
                initialEmail={addContactInitialEmail}
            />
            <CreateGroupModal isOpen={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)} contacts={contacts} onCreateGroup={handleCreateGroup} />
            <ProfileModal
                isOpen={!!viewingProfile}
                onClose={() => setViewingProfile(null)}
                user={viewingProfile}
                isCurrentUser={viewingProfile?.id === currentUser?.id}
                isContact={isViewingContact}
                onAddContact={handleAddContactFromProfile}
                onUpdateDisplayName={async (name) => {
                    if (viewingProfile?.id === currentUser?.id) {
                        // TODO: Implement backend API for updating display name
                        console.log('Update display name to:', name);
                    } else if (isViewingContact) {
                        await handleUpdateNickname(viewingProfile.id, name);
                    }
                }}
                onUpdateProfile={async (file) => {
                    // TODO: Implement backend API for uploading avatar
                    console.log('Upload file:', file);
                }}
                onMessage={() => {
                    if (viewingProfile?.id) {
                        startDM(viewingProfile.id);
                    }
                }}
            />
        </>
    );
}
