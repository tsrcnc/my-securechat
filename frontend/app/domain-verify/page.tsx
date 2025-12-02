'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface DomainInfo {
    domainName: string;
    verificationStatus: string;
    ownerEmail: string;
    currentUsers: number;
    maxUsers: number;
    subscriptionStatus: string;
}

interface VerificationInstructions {
    record: {
        type: string;
        name: string;
        value: string;
        instructions: string;
    };
    steps: string[];
}

export default function DomainVerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        }>
            <DomainVerifyContent />
        </Suspense>
    );
}

function DomainVerifyContent() {
    const searchParams = useSearchParams();
    const domainName = searchParams.get('domain');

    const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
    const [instructions, setInstructions] = useState<VerificationInstructions | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string } | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        if (domainName) {
            fetchDomainInfo();
            fetchInstructions();
        }
    }, [domainName]);

    // Auto-refresh status every 30 seconds if pending
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh && domainInfo?.verificationStatus === 'PENDING') {
            interval = setInterval(fetchDomainInfo, 30000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh, domainInfo?.verificationStatus]);

    const fetchDomainInfo = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domainName}`);
            if (response.ok) {
                const data = await response.json();
                setDomainInfo(data);
                if (data.verificationStatus === 'VERIFIED') {
                    setAutoRefresh(false);
                }
            }
        } catch (err) {
            console.error('Failed to fetch domain info', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructions = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domainName}/instructions`);
            if (response.ok) {
                const data = await response.json();
                setInstructions(data);
            }
        } catch (err) {
            console.error('Failed to fetch instructions', err);
        }
    };

    const handleVerify = async () => {
        setVerifying(true);
        setVerificationResult(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/${domainName}/verify`, {
                method: 'POST'
            });
            const data = await response.json();

            setVerificationResult({
                success: data.success,
                message: data.message + (data.details ? `: ${data.details}` : '')
            });

            if (data.success) {
                fetchDomainInfo();
            }
        } catch (err) {
            setVerificationResult({
                success: false,
                message: 'Network error occurred during verification'
            });
        } finally {
            setVerifying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (!domainName) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-100">No domain specified</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <span className="text-brand-700">Step 2 of 3</span>
                        <span>Verify Ownership</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-600 w-2/3 rounded-full"></div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2 tracking-tight">{domainName}</h1>
                            <p className="text-slate-500 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {domainInfo?.ownerEmail}
                            </p>
                        </div>
                        <div className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide uppercase border ${domainInfo?.verificationStatus === 'VERIFIED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                            {domainInfo?.verificationStatus}
                        </div>
                    </div>
                </div>

                {domainInfo?.verificationStatus === 'PENDING' && instructions && (
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Step 1: DNS Records */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-bold">1</div>
                                <h2 className="font-heading text-lg font-bold text-slate-900">Copy DNS Records</h2>
                            </div>

                            <div className="p-6 space-y-6 flex-1">
                                <p className="text-sm text-slate-500">
                                    Add this <strong>TXT Record</strong> to your domain's DNS settings.
                                </p>

                                {/* Host Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Host / Name
                                    </label>
                                    <div className="flex gap-2">
                                        <code className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-mono text-brand-700 break-all">
                                            {instructions.record.name}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(instructions.record.name)}
                                            className="bg-white border border-slate-200 text-slate-600 px-4 rounded-xl hover:bg-slate-50 hover:text-brand-700 hover:border-brand-200 font-medium transition-all shadow-sm"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Note: Some providers only require the part before the domain name.</p>
                                </div>

                                {/* Value */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Value / Content
                                    </label>
                                    <div className="flex gap-2">
                                        <code className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-mono text-brand-700 break-all">
                                            {instructions.record.value}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(instructions.record.value)}
                                            className="bg-white border border-slate-200 text-slate-600 px-4 rounded-xl hover:bg-slate-50 hover:text-brand-700 hover:border-brand-200 font-medium transition-all shadow-sm"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Type & TTL */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono font-bold text-slate-900 text-center">TXT</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">TTL</label>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-500 text-center">Auto / 3600</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Verify */}
                        <div className="space-y-8 flex flex-col">
                            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex-1">
                                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center font-bold">2</div>
                                    <h2 className="font-heading text-lg font-bold text-slate-900">Verify Ownership</h2>
                                </div>
                                <div className="p-6 flex flex-col h-full justify-center">
                                    <p className="text-slate-500 mb-8 text-center">
                                        After adding the record, wait a few minutes for DNS propagation (it can take up to 24 hours in rare cases).
                                    </p>

                                    <button
                                        onClick={handleVerify}
                                        disabled={verifying}
                                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-700/20 transition-all transform hover:-translate-y-1 ${verifying
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-brand-700 text-white hover:bg-brand-800'
                                            }`}
                                    >
                                        {verifying ? 'Verifying...' : 'Verify Domain Now ✨'}
                                    </button>

                                    {verificationResult && (
                                        <div className={`mt-6 p-4 rounded-xl text-sm border ${verificationResult.success
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            <p className="font-bold mb-1">
                                                {verificationResult.success ? 'Success!' : 'Verification Failed'}
                                            </p>
                                            <p>{verificationResult.message}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Help Section */}
                            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <span>ℹ️</span> Need Help?
                                </h3>
                                <ul className="text-sm text-slate-500 space-y-2 list-disc list-inside">
                                    <li>Ensure you selected <strong>TXT</strong> as record type</li>
                                    <li>Check if your provider needs <strong>@</strong> as host</li>
                                    <li>Wait 5-10 minutes for changes to apply</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {domainInfo?.verificationStatus === 'VERIFIED' && (
                    <div className="bg-white border border-green-100 rounded-2xl p-12 text-center shadow-xl shadow-green-900/5">
                        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl border border-green-100">
                            ✓
                        </div>
                        <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Domain Verified!</h2>
                        <p className="text-slate-500 text-lg mb-8">
                            You can now register user accounts with <strong>@{domainName}</strong> emails.
                        </p>
                        <a
                            href={`/register?type=admin&email=${domainInfo.ownerEmail}`}
                            className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/20"
                        >
                            Step 3: Create Admin Account →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
