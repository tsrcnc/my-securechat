import { useState } from 'react';

interface Contact {
    id: string;
    displayName: string;
    email: string;
}

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: Contact[];
    onCreateGroup: (name: string, participantIds: string[]) => Promise<void>;
}

export default function CreateGroupModal({ isOpen, onClose, contacts, onCreateGroup }: CreateGroupModalProps) {
    const [name, setName] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedContacts.length === 0) return;

        setIsLoading(true);
        try {
            await onCreateGroup(name, selectedContacts);
            setName('');
            setSelectedContacts([]);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleContact = (id: string) => {
        setSelectedContacts(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Group</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Group Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
                            placeholder="My Awesome Group"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Participants
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                            {contacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => toggleContact(contact.id)}
                                    className={`p-2 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedContacts.includes(contact.id) ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.includes(contact.id)}
                                        readOnly
                                        className="mr-3"
                                    />
                                    <span className="text-gray-800 dark:text-gray-200">{contact.displayName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || selectedContacts.length === 0}
                            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
