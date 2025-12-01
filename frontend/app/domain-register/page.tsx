'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DomainRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        domainName: '',
        ownerEmail: '',
        companyName: '',
        contactPhone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [registeredDomain, setRegisteredDomain] = useState<any>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/domains/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setRegisteredDomain(data.domain);
            } else {
                setError(data.message || data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success && registeredDomain) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Domain Registered Successfully!
                        </h1>
                        <p className="text-gray-600">
                            Your domain has been registered. Please verify it to start using My SecureChat.
                        </p>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                        <h2 className="font-semibold text-gray-900 mb-2">📧 Check Your Email</h2>
                        <p className="text-sm text-gray-700 mb-1">
                            A verification email has been sent to:
                        </p>
                        <p className="text-blue-600 font-mono font-semibold">
                            {registeredDomain.ownerEmail}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Domain Details:</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Domain:</span>
                                <span className="font-semibold">{registeredDomain.domainName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                    {registeredDomain.verificationStatus}
                                </span>
                            </div>
                            {registeredDomain.companyName && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Company:</span>
                                    <span className="font-semibold">{registeredDomain.companyName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push(`/domain-verify?domain=${registeredDomain.domainName}`)}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            suppressHydrationWarning
                        >
                            Verify Domain Now →
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                            suppressHydrationWarning
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Register Your Domain
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Register your company domain to enable My SecureChat for your organization
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="domainName" className="block text-sm font-medium text-gray-700 mb-1">
                            Domain Name *
                        </label>
                        <input
                            type="text"
                            id="domainName"
                            name="domainName"
                            value={formData.domainName}
                            onChange={handleChange}
                            required
                            placeholder="example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter your company domain (e.g., acme.com)</p>
                    </div>

                    <div>
                        <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            Owner Email *
                        </label>
                        <input
                            type="email"
                            id="ownerEmail"
                            name="ownerEmail"
                            value={formData.ownerEmail}
                            onChange={handleChange}
                            required
                            placeholder="admin@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                        <p className="text-xs text-gray-500 mt-1">Admin email for domain verification</p>
                    </div>

                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Acme Corporation"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                    </div>

                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            placeholder="+1 234 567 8900"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            suppressHydrationWarning
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        suppressHydrationWarning
                    >
                        {loading ? 'Registering...' : 'Register Domain'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already registered?{' '}
                        <button
                            onClick={() => router.push('/login')}
                            className="text-blue-600 hover:underline font-semibold"
                            suppressHydrationWarning
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
