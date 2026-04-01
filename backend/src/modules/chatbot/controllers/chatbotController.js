const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const prompt = `You are a helpful customer support chatbot for StayFlow, an online hotel and event booking platform.
Answer the following customer question comprehensively but concisely. 
Customer Question: ${message}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        return res.json({ reply: response.text });
    } catch (error) {
        console.error('Chatbot error:', error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
};
