'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('LOADING');
        setMessage('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            setStatus('SUCCESS');
            setMessage(data.message);
        } catch (error: any) {
            setStatus('ERROR');
            setMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter your email to receive a reset link
                    </p>
                </div>

                {status === 'SUCCESS' ? (
                    <div className="text-center">
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            {message}
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Check your email inbox (and spam folder) for further instructions.
                        </p>
                        <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Back to Login
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'ERROR' && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {message}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="user@yourdomain.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'LOADING'}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'LOADING' ? 'Sending Link...' : 'Send Reset Link'}
                        </button>

                        <div className="text-center mt-4">
                            <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                                ← Back to Login
                            </a>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
