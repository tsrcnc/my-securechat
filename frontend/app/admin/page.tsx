'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    displayName: string;
    isDomainAdmin: boolean;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                router.push('/login');
                return;
            }

            const userData = JSON.parse(userStr);
            if (!userData.isDomainAdmin) {
                router.push('/chat');
                return;
            }

            setUser(userData);
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="text-xl font-bold text-brand-600">SecureChat Admin</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-600">Welcome, {user?.displayName}</span>
                    <button
                        onClick={() => router.push('/chat')}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                        Back to Chat
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-2 text-slate-500">Manage your organization and settings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Organization Settings Card */}
                    <div
                        onClick={() => router.push('/admin/settings')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer group"
                    >
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Organization Settings</h3>
                        <p className="text-slate-500 text-sm">
                            Manage your domain subscription, view usage limits, and update organization details.
                        </p>
                    </div>

                    {/* User Management Card (Placeholder) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 opacity-60 cursor-not-allowed">
                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">User Management</h3>
                        <p className="text-slate-500 text-sm">
                            Add, remove, or modify user accounts within your organization. (Coming Soon)
                        </p>
                    </div>

                    {/* Security Settings Card (Placeholder) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 opacity-60 cursor-not-allowed">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Security Policy</h3>
                        <p className="text-slate-500 text-sm">
                            Configure security settings, password policies, and access controls. (Coming Soon)
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
