import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import { queryAnalytics } from '../../../services/api';

const dk = { card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

// Check if browser supports SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const BotChat = () => {
    const [messages, setMessages] = useState([{
        id: 1, sender: 'bot', text: 'Hello! I am your Analytics Assistant. Ask me anything like \"What was the total revenue this month?\" You can also tap the 🎙️ microphone to speak your question.'
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const finalTranscriptRef = useRef('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ── Speech Recognition setup ──
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
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Store final transcript for auto-send
            if (finalTranscript) {
                finalTranscriptRef.current = finalTranscript;
            }

            // Show interim results in real-time, lock in final
            setInput(finalTranscript || interimTranscript);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto-send if we got a valid final transcript
            const transcript = finalTranscriptRef.current.trim();
            if (transcript) {
                finalTranscriptRef.current = '';
                // Small delay to allow state update, then auto-send
                setTimeout(() => {
                    sendMessage(transcript);
                }, 100);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            finalTranscriptRef.current = '';
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, []);

    const toggleListening = () => {
        if (!SpeechRecognition) {
            setMessages(prev => [...prev, {
                id: Date.now(), sender: 'bot',
                text: 'Sorry, speech recognition is not supported in your browser. Please use Chrome or Edge.'
            }]);
            return;
        }

        if (isListening) {
            finalTranscriptRef.current = input.trim(); // capture whatever is in input
            recognitionRef.current?.stop();
        } else {
            setInput('');
            finalTranscriptRef.current = '';
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // Core send function (used by form submit and auto-send)
    const sendMessage = async (messageText) => {
        const userMsg = messageText.trim();
        if (!userMsg) return;

        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await queryAnalytics(userMsg);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: res.data.answer }]);
        } catch (error) {
            // Show actual backend error if available
            const errMsg = error.response?.data?.answer
                || error.response?.data?.error
                || error.message
                || 'Sorry, I encountered an error processing your request.';
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: errMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
    };

    const quickQuestions = [
        "Total revenue this month?",
        "How many bookings today?",
        "What's the occupancy rate?",
        "Any active alerts?"
    ];

    return (
        <div className="rounded-xl flex flex-col h-full border" style={{ background: dk.card, borderColor: dk.border }}>
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: dk.border }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm" style={{ color: dk.text }}>Analytics Assistant</h3>
                    <p className="text-xs" style={{ color: dk.textSec }}>Powered by StayFlow BI</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-medium" style={{ color: '#34d399' }}>Online</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#0f1117' }}>
                {/* Quick questions (shown only when just the initial message) */}
                {messages.length === 1 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1" style={{ color: dk.textSec }}>
                            <Sparkles className="w-3 h-3" /> Suggested Questions
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {quickQuestions.map((q, i) => (
                                <button key={i} onClick={() => { setInput(q); }}
                                    className="text-left text-xs p-3 rounded-lg border transition-all hover:border-indigo-500/50"
                                    style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex items-end gap-2 max-w-[80%]">
                            {msg.sender === 'bot' && (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
                                    style={{ background: '#6366f120' }}>
                                    <Bot className="w-4 h-4 text-indigo-400" />
                                </div>
                            )}
                            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                msg.sender === 'user'
                                    ? 'rounded-br-md'
                                    : 'rounded-bl-md'
                            }`}
                                style={msg.sender === 'user'
                                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }
                                    : { background: dk.elevated, color: dk.text, border: `1px solid ${dk.border}` }
                                }>
                                {msg.text}
                            </div>
                            {msg.sender === 'user' && (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
                                    style={{ background: '#6366f1' }}>
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-end gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
                                style={{ background: '#6366f120' }}>
                                <Bot className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="rounded-2xl rounded-bl-md px-4 py-3 border"
                                style={{ background: dk.elevated, borderColor: dk.border }}>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t" style={{ borderColor: dk.border }}>
                {/* Listening indicator */}
                {isListening && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: '#ef444420', border: '1px solid #ef444444' }}>
                        <div className="relative flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                            <div className="absolute w-5 h-5 rounded-full bg-red-500 opacity-30 animate-ping"></div>
                        </div>
                        <span className="text-xs font-medium text-red-400">Listening... speak your question</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    {/* Mic button */}
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all hover:scale-105 relative ${isListening ? 'ring-2 ring-red-500/50' : ''}`}
                        style={{
                            background: isListening
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : dk.elevated,
                            border: `1px solid ${isListening ? '#ef4444' : dk.border}`
                        }}
                        title={isListening ? 'Stop listening' : 'Voice input'}
                    >
                        {isListening ? (
                            <MicOff className="w-5 h-5 text-white" />
                        ) : (
                            <Mic className="w-5 h-5" style={{ color: dk.textSec }} />
                        )}
                        {isListening && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                        )}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isListening ? 'Listening...' : 'Ask a question about your data...'}
                        className="flex-1 px-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-indigo-500 transition"
                        style={{ background: dk.elevated, borderColor: isListening ? '#6366f1' : dk.border, color: dk.text }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 rounded-xl text-white disabled:opacity-30 transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BotChat;
