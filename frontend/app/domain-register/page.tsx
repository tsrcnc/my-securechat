'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DomainRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        domainName: '',
        ownerEmail: '',
        companyName: '',
        contactPhone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(formData.domainName)) {
            setError('Invalid domain format. Please enter a valid domain name (e.g., example.com).');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 200 && data.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        router.push(`/domain-verify?domain=${formData.domainName}`);
                    }, 2000);
                    return;
                }

                // Handle Zod validation errors from backend
                if (data.details && Array.isArray(data.details)) {
                    const firstError = data.details[0];
                    throw new Error(firstError.message || data.error || 'Registration failed');
                }

                throw new Error(data.message || data.error || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/domain-verify?domain=${formData.domainName}`);
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-brand-700 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-brand-700/20">
                        S
                    </div>
                </div>
                <h2 className="text-center text-3xl font-heading font-bold tracking-tight text-slate-900">
                    Register Your Domain
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Enable secure messaging for your organization
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <span className="text-brand-700">Step 1 of 3</span>
                        <span>Register Domain</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-600 w-1/3 rounded-full"></div>
                    </div>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Domain Name */}
                        <div>
                            <label htmlFor="domainName" className="block text-sm font-semibold text-slate-700">
                                Domain Name
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="domainName"
                                    name="domainName"
                                    type="text"
                                    required
                                    placeholder="e.g., acme.com"
                                    className={`appearance-none block w-full px-4 py-3 border rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all ${error && error.includes('domain') ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                                        }`}
                                    value={formData.domainName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, domainName: e.target.value });
                                        if (error) setError('');
                                    }}
                                    onBlur={() => {
                                        if (formData.domainName) {
                                            const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
                                            if (!domainRegex.test(formData.domainName)) {
                                                setError('Invalid domain format. Please enter a valid domain name (e.g., example.com).');
                                            }
                                        }
                                    }}
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>

                        {/* Owner Email */}
                        <div>
                            <label htmlFor="ownerEmail" className="block text-sm font-semibold text-slate-700">
                                Administrator Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="ownerEmail"
                                    name="ownerEmail"
                                    type="email"
                                    required
                                    placeholder="admin@acme.com"
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
                                    value={formData.ownerEmail}
                                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>

                        {/* Company Name */}
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700">
                                Company Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    placeholder="Acme Corp"
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-semibold text-slate-700">
                                Contact Phone (Optional)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="contactPhone"
                                    name="contactPhone"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                                        <div className="mt-1 text-sm text-red-600">{error}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            Success! Redirecting to verification...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-700/20 text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all transform hover:-translate-y-0.5 ${(loading || success) ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                suppressHydrationWarning
                            >
                                {loading ? 'Processing...' : 'Register Domain'}
                            </button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">
                                Already registered?
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <Link
                            href="/login"
                            className="w-full inline-flex justify-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors"
                        >
                            Sign in to your account
                        </Link>
                    </div>
                </div>
            </div>
        </div>

    );
}
