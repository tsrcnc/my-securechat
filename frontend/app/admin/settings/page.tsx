'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DomainInfo {
    id: string;
    domainName: string;
    ownerEmail: string;
    subscriptionStatus: string;
    subscriptionEndDate: string | null;
    maxUsers: number;
    createdAt: string;
}

export default function OrganizationSettingsPage() {
    const router = useRouter();
    const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('subscription');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchDomainInfo();
    }, []);

    const fetchDomainInfo = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.push('/login');
                return;
            }
            const user = JSON.parse(userStr);

            // In a real app, we'd have a dedicated endpoint for this. 
            // For now, we'll fetch public info and augment it or assume the user object has domainId
            // But wait, the public endpoint /api/domains/:domainName returns info.
            // We need the domain ID for admin actions.
            // Let's assume the user object has domainId.

            if (!user.domainId) {
                throw new Error('No domain associated with user');
            }

            // We need to get the domain name to fetch info
            // Or we can fetch by ID if we had an endpoint.
            // Let's fetch the user's profile or similar to get domain details?
            // Actually, let's just use the domain name from the user's email or similar if available.
            // Or better, let's assume we can get it from the user object if it was populated.

            // Fallback: Fetch domain info using the domain name extracted from email
            const domainName = user.email.split('@')[1];
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domainName}`);
            if (res.ok) {
                const data = await res.json();
                setDomainInfo(data);
            }
        } catch (err) {
            console.error('Failed to fetch domain info', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!domainInfo || !confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Trial plan.')) return;

        setProcessing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domainInfo.id}/cancel-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // Add Authorization header here if needed
                }
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Subscription cancelled successfully' });
                fetchDomainInfo();
            } else {
                throw new Error(data.message || 'Failed to cancel subscription');
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteOrganization = async () => {
        if (!domainInfo) return;
        if (deleteConfirmText !== domainInfo.domainName) {
            setMessage({ type: 'error', text: 'Domain name does not match' });
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domainInfo.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                    // Add Authorization header here if needed
                }
            });

            const data = await res.json();
            if (res.ok) {
                // Clear local storage and redirect to home
                localStorage.clear();
                router.push('/');
            } else {
                throw new Error(data.message || 'Failed to delete organization');
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!domainInfo) {
        return (
            <div className="p-8 text-center text-slate-500">
                Failed to load organization details.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-slate-900">Organization Settings</h1>
                    <p className="mt-2 text-slate-500">Manage your domain, subscription, and organization data.</p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="border-b border-slate-100">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('subscription')}
                                className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${activeTab === 'subscription'
                                        ? 'border-brand-600 text-brand-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                Subscription
                            </button>
                            <button
                                onClick={() => setActiveTab('danger')}
                                className={`py-4 px-8 text-sm font-medium border-b-2 transition-colors ${activeTab === 'danger'
                                        ? 'border-red-500 text-red-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                Danger Zone
                            </button>
                        </nav>
                    </div>

                    <div className="p-8">
                        {activeTab === 'subscription' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Current Plan</h3>
                                    <div className="mt-4 bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Plan Status</p>
                                                <p className="mt-1 text-2xl font-bold text-slate-900">{domainInfo.subscriptionStatus}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Max Users</p>
                                                <p className="mt-1 text-2xl font-bold text-slate-900">{domainInfo.maxUsers}</p>
                                            </div>
                                        </div>
                                        {domainInfo.subscriptionEndDate && (
                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <p className="text-sm text-slate-500">
                                                    Ends on: {new Date(domainInfo.subscriptionEndDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {domainInfo.subscriptionStatus !== 'TRIAL' && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={processing}
                                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                                        >
                                            Cancel Subscription
                                        </button>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Downgrades to Trial plan immediately.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'danger' && (
                            <div className="space-y-6">
                                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-red-800">Delete Organization</h3>
                                    <p className="mt-2 text-sm text-red-600">
                                        This action is irreversible. It will permanently delete:
                                    </p>
                                    <ul className="mt-2 list-disc list-inside text-sm text-red-600 ml-2">
                                        <li>The domain <strong>{domainInfo.domainName}</strong></li>
                                        <li>All user accounts</li>
                                        <li>All messages and conversations</li>
                                        <li>All subscription data</li>
                                    </ul>

                                    {!showDeleteConfirm ? (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition"
                                        >
                                            Delete Organization
                                        </button>
                                    ) : (
                                        <div className="mt-6 bg-white p-4 rounded-lg border border-red-200">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Type <strong>{domainInfo.domainName}</strong> to confirm:
                                            </label>
                                            <input
                                                type="text"
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                placeholder={domainInfo.domainName}
                                            />
                                            <div className="mt-4 flex gap-3">
                                                <button
                                                    onClick={handleDeleteOrganization}
                                                    disabled={processing || deleteConfirmText !== domainInfo.domainName}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processing ? 'Deleting...' : 'Confirm Delete'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirm(false);
                                                        setDeleteConfirmText('');
                                                    }}
                                                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
