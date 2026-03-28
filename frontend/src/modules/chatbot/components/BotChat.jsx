import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { queryAnalytics } from '../../../services/api';

const BotChat = () => {
    const [messages, setMessages] = useState([{
        id: 1, sender: 'bot', text: 'Hello! I am your Analytics Assistant. Ask me anything like "What was the total revenue this month?"'
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await queryAnalytics(userMsg);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: res.data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Sorry, I encountered an error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-xl p-6 shadow-soft flex flex-col h-[500px]">
            <h3 className="text-lg font-bold mb-4 flex items-center">
                <Bot className="text-accent w-6 h-6 mr-2" />
                Conversational BI
            </h3>

            <div className="flex-1 overflow-y-auto mb-4 bg-background p-4 rounded-lg space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white shadow text-gray-800'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white shadow rounded-lg p-3">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex relative">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default BotChat;
