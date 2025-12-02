import { useState } from 'react';

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-gray-600 transition dark:text-white"
                    disabled={disabled}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-brand-600/20 flex items-center gap-2"
                >
                    <span className="hidden sm:inline">Send</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
