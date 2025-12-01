import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-100 selection:text-brand-900 font-sans">

            {/* Navbar */}
            <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-brand-700/20">
                                S
                            </div>
                            <span className="font-heading font-bold text-xl tracking-tight text-slate-900">My SecureChat</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/login" className="text-slate-600 hover:text-brand-700 transition-colors font-medium text-sm">
                                Sign In
                            </Link>
                            <Link
                                href="/domain-register"
                                className="bg-brand-700 text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-800 transition-all shadow-md shadow-brand-700/20 hover:shadow-lg hover:shadow-brand-700/30 transform hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-40 pb-24 sm:pt-48 sm:pb-32 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                        </span>
                        Now available for Enterprise
                    </div>

                    <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tight mb-8 text-slate-900 leading-tight">
                        Secure Messaging for <br />
                        <span className="text-brand-700 relative">
                            Modern Teams
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                        End-to-end encrypted communication platform built for privacy-first companies.
                        Verify your domain and start chatting securely in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/domain-register"
                            className="w-full sm:w-auto px-8 py-4 bg-brand-700 text-white rounded-xl font-semibold text-lg hover:bg-brand-800 transition-all shadow-xl shadow-brand-700/20 hover:shadow-2xl hover:shadow-brand-700/30 transform hover:-translate-y-1"
                        >
                            Register Your Domain
                        </Link>
                        <Link
                            href="/register"
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                        >
                            Join Existing Team
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-32 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Why Choose SecureChat?</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Built with security and usability in mind, providing the best experience for your organization.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-900/5 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">Domain Verification</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Strict DNS-based verification ensures only authorized employees with your company email can join your workspace.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-900/5 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">Real-time Chat</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Instant messaging powered by Socket.IO. Experience zero-latency communication with your team members.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-900/5 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">Enterprise Security</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Bank-grade encryption, comprehensive audit logs, and role-based access control for complete peace of mind.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100 bg-white text-center text-slate-400">
                <p>© 2024 My SecureChat. All rights reserved.</p>
            </footer>
        </div>
    );
}
