import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const C = {
    900: '#012A4A', 800: '#013A63', 700: '#01497C', 600: '#014F86',
    500: '#2A6F97', 400: '#2C7DA0', 300: '#468FAF', 200: '#61A5C2',
    100: '#89C2D9', 50: '#A9D6E5',
};

const CustomerChatWidget = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hi there! I am your StayFlow virtual assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/chatbot/ask', { message: userMsg });
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: res.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 transition-all duration-300 ease-in-out">
                    <div className="p-4 flex items-center justify-between text-white" style={{ background: `linear-gradient(135deg, ${C[600]}, ${C[500]})` }}>
                        <div className="flex items-center gap-2">
                            <Bot size={24} />
                            <div>
                                <h3 className="font-bold">StayFlow Assistant</h3>
                                <p className="text-xs opacity-80 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition"><X size={20} /></button>
                    </div>

                    <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end gap-2 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${m.sender === 'user' ? 'bg-gray-100 text-gray-600' : 'text-white'}`} style={m.sender === 'bot' ? { backgroundColor: C[600] } : {}}>
                                        {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'text-white rounded-br-sm' : 'bg-white border shadow-sm text-gray-800 rounded-bl-sm'} whitespace-pre-wrap leading-relaxed`} style={m.sender === 'user' ? { backgroundColor: C[500] } : {}}>
                                        {m.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border shadow-sm p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                    <Loader2 size={16} className="animate-spin" style={{ color: C[500] }} /> <span className="text-xs text-gray-500">Typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 border-t bg-white flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-xl outline-none text-sm transition"
                            style={{ focusRing: C[500] }}
                            disabled={loading}
                        />
                        <button type="submit" disabled={!input.trim() || loading} className="p-2.5 text-white rounded-xl disabled:opacity-50 transition hover:brightness-110" style={{ backgroundColor: C[600] }}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-2xl text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${isOpen ? 'rotate-90' : ''}`}
                style={{ background: isOpen ? C[900] : `linear-gradient(135deg, ${C[600]}, ${C[500]})` }}
                aria-label="Chat Support"
            >
                {isOpen ? <X size={28} className="-rotate-90" /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
};

export default CustomerChatWidget;
