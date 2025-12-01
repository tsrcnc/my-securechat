'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto p-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Welcome to My SecureChat! 🎉
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Hello, {user.displayName}!
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4 mb-6">
                        <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                            ✅ Success! Registration & Login Working!
                        </h2>
                        <p className="text-green-700 dark:text-green-300">
                            Your account has been created and you are now logged in with the real Supabase database.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                            <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                            <p className="font-mono text-sm">{user.id}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-mono text-sm">{user.email}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display Name</p>
                            <p className="font-mono text-sm">{user.displayName}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Domain ID</p>
                            <p className="font-mono text-sm">{user.domainId}</p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                            🚀 What's Next?
                        </h3>
                        <ul className="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-1">
                            <li>Chat interface (coming soon)</li>
                            <li>Real-time messaging with Socket.IO</li>
                            <li>File sharing</li>
                            <li>Group chats</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
