'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <nav className="flex justify-between items-center mb-20">
                    <div className="text-white">
                        <h1 className="text-2xl font-bold">My SecureChat</h1>
                        <p className="text-blue-200 text-sm">Enterprise Messaging Platform</p>
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
                        suppressHydrationWarning
                    >
                        Sign In
                    </button>
                </nav>

                {/* Hero Section */}
                <div className="text-center text-white mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold mb-6">
                        Secure Messaging for<br />Your Organization
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
                        Domain-based chat platform with end-to-end encryption.<br />
                        Perfect for businesses that value privacy and security.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => router.push('/domain-register')}
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-2xl w-full md:w-auto"
                            suppressHydrationWarning
                        >
                            🏢 Register Your Domain
                        </button>
                        <button
                            onClick={() => router.push('/register')}
                            className="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-400 transition border-2 border-white w-full md:w-auto"
                            suppressHydrationWarning
                        >
                            👤 Create Account
                        </button>
                    </div>

                    <p className="text-blue-200 text-sm mt-6">
                        Already have an account?{' '}
                        <button
                            onClick={() => router.push('/login')}
                            className="text-white underline hover:text-blue-100"
                            suppressHydrationWarning
                        >
                            Sign in here
                        </button>
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 text-white">
                        <div className="text-4xl mb-4">🔐</div>
                        <h3 className="text-xl font-bold mb-2">Domain Verification</h3>
                        <p className="text-blue-100">
                            Verify your company domain via DNS to ensure only authorized users join your organization's chat.
                        </p>
                    </div>

                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 text-white">
                        <div className="text-4xl mb-4">💬</div>
                        <h3 className="text-xl font-bold mb-2">Real-time Messaging</h3>
                        <p className="text-blue-100">
                            Chat instantly with your team members. Messages sync in real-time across all devices.
                        </p>
                    </div>

                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 text-white">
                        <div className="text-4xl mb-4">🛡️</div>
                        <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                        <p className="text-blue-100">
                            Built for businesses with features like audit logs, user management, and secure data storage.
                        </p>
                    </div>
                </div>

                {/* How It Works */}
                <div className="mt-20 max-w-3xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-6 text-center">How It Works</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">1</div>
                            <div>
                                <h4 className="font-semibold mb-1">Admin Registers Domain</h4>
                                <p className="text-blue-100 text-sm">Company administrator registers the company domain (e.g., acme.com)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">2</div>
                            <div>
                                <h4 className="font-semibold mb-1">Verify Domain via DNS</h4>
                                <p className="text-blue-100 text-sm">Add a TXT record to your DNS to prove domain ownership</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">3</div>
                            <div>
                                <h4 className="font-semibold mb-1">Employees Create Accounts</h4>
                                <p className="text-blue-100 text-sm">Team members register with their company email and start chatting!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 text-center text-blue-200 text-sm">
                    <p>© 2025 TSR CNC - My SecureChat. All rights reserved.</p>
                    <p className="mt-2">Secure messaging for verified domains</p>
                </div>
            </div>
        </div>
    );
}
