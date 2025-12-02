import { useState, useEffect } from 'react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        displayName: string;
        email: string;
        avatarUrl?: string;
    } | null;
    isCurrentUser?: boolean;
    onUpdateProfile?: (file: File) => Promise<void>;
    onUpdateDisplayName?: (name: string) => Promise<void>;
}

export default function ProfileModal({ isOpen, onClose, user, isCurrentUser, onUpdateProfile, onUpdateDisplayName }: ProfileModalProps) {
    const [uploading, setUploading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (user) {
            setNewName(user.displayName);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && onUpdateProfile) {
            setUploading(true);
            try {
                await onUpdateProfile(e.target.files[0]);
            } catch (error) {
                console.error('Failed to upload profile photo', error);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSaveName = async () => {
        if (onUpdateDisplayName && newName.trim() !== '') {
            await onUpdateDisplayName(newName);
            setIsEditingName(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all">
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black bg-opacity-20 rounded-full p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="relative px-6 pb-6 pt-16">
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                        <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 flex items-center justify-center shadow-lg">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-gray-500">{user.displayName?.charAt(0).toUpperCase()}</span>
                            )}

                            {isCurrentUser && (
                                <label className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center cursor-pointer transition-opacity group">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        {isCurrentUser && isEditingName ? (
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-center bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button onClick={handleSaveName} className="text-green-500 hover:text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button onClick={() => setIsEditingName(false)} className="text-red-500 hover:text-red-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.displayName}</h2>
                                {isCurrentUser && (
                                    <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                )}
                            </div>
                        )}

                        <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>

                        {isCurrentUser && uploading && (
                            <p className="text-sm text-blue-500 mt-2">Uploading...</p>
                        )}
                    </div>

                    {!isCurrentUser && (
                        <div className="mt-8 flex justify-center space-x-4">
                            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium">
                                Message
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
