export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                    My SecureChat
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Domain-Based Enterprise Messaging Platform
                </p>
                <div className="space-x-4">
                    <a
                        href="/login"
                        className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </a>
                    <a
                        href="/register-domain"
                        className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition"
                    >
                        Register Domain
                    </a>
                </div>
                <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
                    <p>✅ Domain-based authentication</p>
                    <p>✅ Real-time messaging</p>
                    <p>✅ Enterprise-grade security</p>
                </div>
            </div>
        </div>
    );
}
