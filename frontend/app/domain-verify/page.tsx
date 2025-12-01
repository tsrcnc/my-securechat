'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DomainVerifyPage() {
    const searchParams = useSearchParams();
    const domainParam = searchParams.get('domain');

    const [domain, setDomain] = useState(domainParam || '');
    const [domainInfo, setDomainInfo] = useState<any>(null);
    const [instructions, setInstructions] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch domain info
    useEffect(() => {
        if (domain) {
            fetchDomainInfo();
            fetchInstructions();
        }
    }, [domain]);

    // Auto-refresh status every 30s
    useEffect(() => {
        if (!autoRefresh || !domain || domainInfo?.verificationStatus === 'VERIFIED') return;

        const interval = setInterval(() => {
            fetchDomainInfo();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, domain, domainInfo]);

    const fetchDomainInfo = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domain}`);
            const data = await response.json();
            if (response.ok) {
                setDomainInfo(data);
            } else {
                setError(data.error || 'Failed to fetch domain info');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const fetchInstructions = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domain}/instructions`);
            const data = await response.json();
            if (response.ok) {
                setInstructions(data);
            }
        } catch (err) {
            console.error('Failed to fetch instructions:', err);
        }
    };

    const handleVerify = async () => {
        setVerifying(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domain}/verify`, {
                method: 'POST'
            });
            const data = await response.json();

            if (response.ok && data.verified) {
                alert('✅ Domain verified successfully!');
                fetchDomainInfo(); // Refresh status
            } else {
                setError(data.details || data.message || 'Verification failed');
            }
        } catch (err: any) {
            setError('Verification request failed');
        } finally {
            setVerifying(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            VERIFIED: 'bg-green-100 text-green-800 border-green-300',
            REJECTED: 'bg-red-100 text-red-800 border-red-300'
        };
        return styles[status as keyof typeof styles] || styles.PENDING;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Domain Verification
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Verify your domain to enable My SecureChat for your organization
                    </p>
                </div>

                {/* Domain Input (if not provided) */}
                {!domainParam && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Enter your domain name
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="example.com"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <button
                                onClick={fetchDomainInfo}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Check
                            </button>
                        </div>
                    </div>
                )}

                {/* Status Card */}
                {domainInfo && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {domainInfo.domainName}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Owner: {domainInfo.ownerEmail}
                                </p>
                            </div>
                            <span className={`px-4 py-2 rounded-full border font-semibold ${getStatusBadge(domainInfo.verificationStatus)}`}>
                                {domainInfo.verificationStatus}
                            </span>
                        </div>

                        {domainInfo.verificationStatus === 'VERIFIED' && domainInfo.verifiedAt && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
                                <p className="text-green-800 dark:text-green-200 font-medium">
                                    ✅ Verified on {new Date(domainInfo.verifiedAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}

                        {/* DNS Instructions */}
                        {domainInfo.verificationStatus === 'PENDING' && instructions && (
                            <>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        📋 DNS TXT Record Details
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Host/Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Host/Name:
                                            </label>
                                            <div className="flex gap-2">
                                                <code className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm break-all">
                                                    {instructions.record.name}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(instructions.record.name, 'name')}
                                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                                    suppressHydrationWarning
                                                >
                                                    {copied === 'name' ? '✓ Copied' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Type:
                                            </label>
                                            <code className="block px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm">
                                                {instructions.record.type}
                                            </code>
                                        </div>

                                        {/* Value */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Value:
                                            </label>
                                            <div className="flex gap-2">
                                                <code className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm break-all">
                                                    {instructions.record.value}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(instructions.record.value, 'value')}
                                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                                    suppressHydrationWarning
                                                >
                                                    {copied === 'value' ? '✓ Copied' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        🔧 Verification Steps
                                    </h3>
                                    <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                                        {instructions.steps.map((step: string, index: number) => (
                                            <li key={index} className="flex gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Verify Button */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleVerify}
                                        disabled={verifying}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        suppressHydrationWarning
                                    >
                                        {verifying ? 'Checking DNS...' : '🔍 Verify Now'}
                                    </button>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                            className="w-4 h-4"
                                            suppressHydrationWarning
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Auto-refresh status
                                        </span>
                                    </label>
                                </div>

                                {error && (
                                    <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg text-sm">
                                        <p className="font-semibold mb-1">Verification Failed</p>
                                        <p>{error}</p>
                                        <p className="mt-2 text-xs">
                                            💡 Tip: DNS changes can take up to 24 hours to propagate. Please wait and try again later.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Domain Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{domainInfo.currentUsers || 0}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{domainInfo.maxUsers}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Max Users</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{domainInfo.subscriptionStatus}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        ℹ️ Need Help?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        If you're having trouble verifying your domain, please check:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>DNS TXT record is added correctly</li>
                        <li>DNS changes have propagated (check with DNS lookup tools)</li>
                        <li>No typos in the record name or value</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Contact support: <a href="mailto:support@mysecurechat.org" className="text-blue-600 hover:underline">support@mysecurechat.org</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
