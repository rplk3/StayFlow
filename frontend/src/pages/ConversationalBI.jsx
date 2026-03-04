import React from 'react';
import BotChat from '../components/BotChat';

const ConversationalBI = () => {
    return (
        <div className="space-y-6 flex flex-col h-full h-[calc(100vh-120px)]">
            <div>
                <h1 className="text-2xl font-bold text-textPrimary">Conversational BI</h1>
                <p className="text-textSecondary">Ask questions about your data in plain English.</p>
            </div>

            <div className="flex-1 max-w-4xl w-full">
                <BotChat />
            </div>
        </div>
    );
};

export default ConversationalBI;
