import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Mic, MicOff, Image as ImageIcon, X, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { queryAnalytics } from '../services/api';

const BotChat = () => {
    const [messages, setMessages] = useState([{
        id: 1,
        sender: 'bot',
        text: '👋 **Hello!** I am your StayFlow Analytics Assistant.\n\nAsk me anything about your property, like:\n- *What was our total revenue this month?*\n- *How is our occupancy rate looking?*'
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsRecording(true);
            } else {
                alert("Speech recognition is not supported in this browser.");
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Image Compression Logic
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressed = await compressImage(file);
            setSelectedImage(compressed);
            setImagePreview(URL.createObjectURL(compressed));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Text to Speech
    const speak = (text) => {
        if (!isVoiceActive) return;
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        synth.speak(utterance);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() && !selectedImage) return;

        const userMsg = input.trim();
        const currentImage = selectedImage;
        const currentPreview = imagePreview;

        setMessages(prev => [...prev, { 
            id: Date.now(), 
            sender: 'user', 
            text: userMsg,
            image: currentPreview 
        }]);

        setInput('');
        removeImage();
        setIsLoading(true);

        try {
            // Use FormData for image upload
            let response;
            if (currentImage) {
                const formData = new FormData();
                formData.append('question', userMsg || "What's in this image?");
                formData.append('image', currentImage);
                response = await queryAnalytics(formData);
            } else {
                response = await queryAnalytics(userMsg);
            }
            
            const botResponse = response.data.answer;
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
            
            if (isVoiceActive) {
                speak(botResponse.replace(/[#*`]/g, ''));
            }
        } catch (error) {
            console.error("Chat API error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Sorry, I encountered an error connecting to the AI." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[650px] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-[#0047a0] to-secondary p-5 flex items-center justify-between shrink-0 border-b border-blue-800/20">
                <div className="flex items-center">
                    <div className="bg-white/10 p-2.5 rounded-xl mr-4 backdrop-blur-md border border-white/20 shadow-inner">
                        <Sparkles className="text-white w-5 h-5 drop-shadow-md" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide shrink-0 drop-shadow-sm flex items-center gap-2">
                            StayFlow AI
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                        </h3>
                        <p className="text-blue-100/90 text-[13px] font-medium tracking-wide">Your intelligent property assistant</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsVoiceActive(!isVoiceActive)}
                    className={`p-2 rounded-full transition-all ${isVoiceActive ? 'bg-white/20 text-white' : 'bg-transparent text-white/50'}`}
                    title={isVoiceActive ? "Mute Voice Response" : "Unmute Voice Response"}
                >
                    {isVoiceActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] space-y-6 scroll-smooth">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        {msg.sender === 'bot' && (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-3 shrink-0 shadow-md border-2 border-white">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                        )}

                        <div className={`max-w-[80%] p-4 text-[14.5px] shadow-sm transform transition-all duration-300 ${msg.sender === 'user'
                            ? 'bg-gradient-to-br from-secondary to-[#005c9e] text-white rounded-2xl rounded-tr-sm shadow-md'
                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                            }`}>
                            
                            {msg.image && (
                                <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                                    <img src={msg.image} alt="Uploaded" className="max-w-full h-auto max-h-64 object-contain" />
                                </div>
                            )}

                            {msg.sender === 'user' ? (
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            ) : (
                                <div className="space-y-2.5 leading-relaxed">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1.5" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1.5" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900 bg-blue-50/50 px-1 rounded" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-secondary hover:text-primary underline decoration-blue-200 underline-offset-2 transition-colors" {...props} />,
                                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-3 mb-2 text-primary" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-[16px] font-bold mt-4 mb-2 text-gray-800 border-b border-gray-100 pb-1" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-[15px] font-semibold mt-3 mb-1.5 text-gray-800" {...props} />
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {msg.sender === 'user' && (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ml-3 shrink-0 shadow-sm border-2 border-white">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-3 shrink-0 shadow-md border-2 border-white">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100/80 p-4 flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-sm text-gray-500 font-medium tracking-wide">Analyzing your property data...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Preview Image Area */}
            {imagePreview && (
                <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg border-2 border-blue-100 overflow-hidden shadow-sm">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            onClick={removeImage}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg shadow-sm hover:bg-red-600 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <span className="text-xs text-gray-500 font-medium italic">Image ready to upload...</span>
                </div>
            )}

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSend} className="relative flex items-center gap-2 group max-w-4xl mx-auto">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageChange}
                    />
                    
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={isRecording ? "Listening..." : "Ask about your hotel's performance..."}
                            className={`w-full pl-6 pr-24 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white placeholder:text-gray-400 shadow-sm text-[15px] ${isRecording ? 'border-red-400 ring-4 ring-red-100' : ''}`}
                        />
                        
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all"
                                title="Upload Image"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`p-2 rounded-xl transition-all ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-secondary hover:bg-secondary/5'}`}
                                title={isRecording ? "Stop Recording" : "Voice Input"}
                            >
                                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            
                            <button
                                type="submit"
                                disabled={isLoading || (!input.trim() && !selectedImage)}
                                className="p-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 shadow-sm"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </form>
                <div className="text-center mt-3">
                    <span className="text-[11px] text-gray-400 font-medium flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-accent" />
                        AI can make mistakes. Verify important metrics against reports.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BotChat;
