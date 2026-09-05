const { GoogleGenAI, Type } = require('@google/genai');
const mongoose = require('mongoose');
const Room = require('../../hotelRoom/models/Room');
const EventHall = require('../../eventHall/models/EventHall');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function queryCustomerDatabase({ collectionName, filter = {} }) {
    console.log(`[Customer Chatbot] Querying ${collectionName} with filter:`, filter);
    try {
        let Model;
        if (collectionName === 'Rooms') Model = Room;
        else if (collectionName === 'EventHalls') Model = EventHall;
        else return { error: `Collection ${collectionName} is not accessible by the agent.` };

        const results = await Model.find(filter).lean().limit(10);
        return {
            message: `Successfully retrieved ${results.length} records.`,
            data: results
        };
    } catch (e) {
        console.error('[Customer Chatbot Error]:', e);
        return { error: 'Database query failed.', details: e.message };
    }
}

const queryCustomerDatabaseTool = {
    name: 'queryCustomerDatabase',
    description: 'Queries the MongoDB database to answer customer questions about hotel rooms or event halls. Use this when the customer asks about room availability, prices, capacities, or types of event halls.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            collectionName: {
                type: Type.STRING,
                description: 'The name of the collection to query. Must be exactly "Rooms" or "EventHalls".',
            },
            filter: {
                type: Type.OBJECT,
                description: 'A valid MongoDB filter object (e.g. {"roomType": "Deluxe"} or {"capacity.max": {"$gte": 50}}). Keep it simple.',
            }
        },
        required: ['collectionName'],
    }
};

exports.askChatbot = async (req, res) => {
    try {
        const { message, audio } = req.body;
        if (!message && !audio) return res.status(400).json({ error: 'Message or audio is required' });

        const systemPrompt = `
You are the advanced helpful Customer Support AI Assistant for StayFlow, an online hotel and event booking platform.
Your job is to answer customer questions accurately and kindly.

If the customer asks about room types, prices, capacities, amenities, or event halls, you MUST use the \`queryCustomerDatabase\` tool to fetch the exact real-time data from the database first, then answer their question based on the tool's result.

Rules:
- Be concise, direct, friendly, and helpful.
- Use markdown for formatting (e.g., bolding room names or prices).
- Never make up prices or room types. Always query the database if you are unsure.
- Base prices are in Rs (LKR).
        `;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.2, 
                tools: [{ functionDeclarations: [queryCustomerDatabaseTool] }]
            }
        });
        
        let inputMessage = message || "Please listen to this voice message and respond accordingly.";
        if (audio && audio.data && audio.mimeType) {
            inputMessage = [
                { text: inputMessage },
                { inlineData: { data: audio.data, mimeType: audio.mimeType } }
            ];
        }
        
        let response = await chat.sendMessage({ message: inputMessage });

        // Handle function calling if the model decides it needs data
        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];

            if (call.name === 'queryCustomerDatabase') {
                const dbResults = await queryCustomerDatabase(call.args);

                response = await chat.sendMessage({
                    message: [{
                        functionResponse: {
                            name: 'queryCustomerDatabase',
                            response: dbResults
                        }
                    }]
                });
            }
        }

        return res.json({ reply: response.text });

    } catch (error) {
        console.error('Chatbot error:', error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
};
