import React from 'react';
import BotChat from '../components/BotChat';
import { MessageSquare } from 'lucide-react';

const ConversationalBI = () => {
    return (
        <div className="space-y-6 flex flex-col h-full h-[calc(100vh-120px)] animate-fade-in">
            <div className="flex items-center space-x-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div className="w-12 h-12 bg-blue-50 text-secondary rounded-xl flex items-center justify-center shadow-inner">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary flex items-center">
                        Customer Support Bot
                        <span className="ml-3 px-2.5 py-1 bg-gradient-to-r from-accent to-yellow-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">Beta</span>
                    </h1>
                    <p className="text-textSecondary mt-1 text-sm font-medium">Ask questions about your data in plain English and get instant insights.</p>
                </div>
            </div>

            <div className="flex-1 max-w-5xl w-full mx-auto pb-4">
                <BotChat />
            </div>
        </div>
    );
};

export default ConversationalBI;
