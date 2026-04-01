
import BotChat from '../components/BotChat';

const dk = { text: '#f1f5f9', textSec: '#94a3b8' };

const ConversationalBI = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold" style={{ color: dk.text }}>Conversational BI</h1>
                <p className="text-sm mt-1" style={{ color: dk.textSec }}>Ask questions about your data in plain English.</p>
            </div>

            <div className="flex-1 w-full max-w-4xl mx-auto">
                <BotChat />
            </div>
        </div>
    );
};

export default ConversationalBI;

