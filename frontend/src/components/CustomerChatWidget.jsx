import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Mic, MicOff } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

/* ───────── Global Color System ───────── */
const C = {
    // Semantic Tokens
    primary: '#0F2D52', action: '#1D6FE8', accent: '#F59E0B', 
    success: '#16A34A', alert: '#C0392B', bg: '#F4F6F9', 
    card: '#FFFFFF', text: '#1A1A2E',
    
    // Legacy mapping to prevent breakages
    900: '#0F2D52', 800: '#0F2D52', 700: '#0F2D52', 600: '#1D6FE8',
    500: '#1D6FE8', 400: '#1D6FE8', 300: '#60A5FA', 200: '#BFDBFE',
    100: '#DBEAFE', 50: '#F0F9FF',
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const CustomerChatWidget = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hi there! I am your StayFlow virtual assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTooltip(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) finalTranscriptRef.current = finalTranscript;
            setInput(finalTranscript || interimTranscript);
        };

        recognition.onend = () => {
            setIsListening(false);
            const transcript = finalTranscriptRef.current.trim();
            if (transcript) {
                finalTranscriptRef.current = '';
                setTimeout(() => {
                    submitMessage(transcript);
                }, 100);
            }
        };

        recognition.onerror = (e) => {
            console.error('Speech error:', e.error);
            setIsListening(false);
            finalTranscriptRef.current = '';
        };

        recognitionRef.current = recognition;
        return () => recognition.abort();
    }, []);

    const toggleListening = () => {
        if (!SpeechRecognition) {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'Speech recognition is not supported in this browser.' }]);
            return;
        }
        if (isListening) {
            finalTranscriptRef.current = input.trim();
            recognitionRef.current?.stop();
        } else {
            setInput('');
            finalTranscriptRef.current = '';
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const submitMessage = async (userMsg) => {
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

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        submitMessage(input.trim());
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

                    <div className="flex-1 p-4 h-[400px] overflow-y-auto bg-gray-50 flex flex-col gap-3 scroll-smooth">
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

                    <form onSubmit={handleSend} className="p-3 border-t bg-white flex flex-col gap-2">
                        {isListening && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 mb-1">
                                <div className="relative flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                                    <div className="absolute w-4 h-4 rounded-full bg-red-500 opacity-30 animate-ping"></div>
                                </div>
                                <span className="text-xs font-medium text-red-500">Listening...</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${isListening ? 'bg-red-500 ring-2 ring-red-400 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                title={isListening ? 'Stop listening' : 'Voice input'}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={isListening ? "Listening..." : "Type a message..."}
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-xl outline-none text-sm transition"
                                style={{ focusRing: C[500] }}
                                disabled={loading}
                            />
                            <button type="submit" disabled={!input.trim() || loading} className="p-2.5 text-white flex items-center justify-center rounded-xl disabled:opacity-50 transition hover:brightness-110" style={{ backgroundColor: C[600] }}>
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="relative flex items-center justify-end group">
                {!isOpen && (
                    <div 
                        className={`absolute right-full mr-4 bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-2 whitespace-nowrap transition-all duration-300 pointer-events-none cursor-pointer ${showTooltip ? 'opacity-100 translate-x-0 group-hover:pointer-events-auto' : 'opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'}`}
                        onClick={() => setIsOpen(true)}
                    >
                        <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Need help?
                        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-gray-100"></div>
                    </div>
                )}
                <button
                    onClick={() => { setIsOpen(!isOpen); setShowTooltip(false); }}
                    onMouseEnter={() => !isOpen && setShowTooltip(true)}
                    onMouseLeave={() => !isOpen && setShowTooltip(false)}
                    className={`p-4 rounded-full shadow-2xl text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${isOpen ? 'rotate-90' : ''}`}
                    style={{ background: isOpen ? C[900] : `linear-gradient(135deg, ${C[600]}, ${C[500]})` }}
                    aria-label="Chat Support"
                >
                    {isOpen ? <X size={28} className="-rotate-90" /> : <MessageCircle size={28} />}
                </button>
            </div>
        </div>
    );
};

export default CustomerChatWidget;
