const { GoogleGenAI, Type } = require('@google/genai');
const mongoose = require('mongoose');
const analyticsService = require('../services/analyticsService');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');


async function queryDatabase({ collectionName, filter = {} }) {
    console.log(`[Database Agent] Querying ${collectionName} with filter:`, filter);
    try {
        let Model;
        if (collectionName === 'Bookings') Model = Booking;
        else if (collectionName === 'Rooms') Model = Room;
        else if (collectionName === 'Payments') Model = Payment;
        else return { error: `Collection ${collectionName} is not accessible by the agent.` };

        const results = await Model.find(filter).lean().limit(20);
        return {
            message: `Successfully retrieved ${results.length} records.`,
            data: results
        };
    } catch (e) {
        console.error('[Database Agent Error]:', e);
        return { error: 'Database query failed.', details: e.message };
    }
}


const queryDatabaseTool = {
    name: 'queryDatabase',
    description: 'Queries the MongoDB database to answer specific user questions about individual records. Accessible collections are: Bookings, Rooms, Payments. Warning: Booking amounts are in LKR (Rs). roomType is capitalized e.g. "Standard".',
    parameters: {
        type: Type.OBJECT,
        properties: {
            collectionName: {
                type: Type.STRING,
                description: 'The name of the collection to query. Must be exactly "Bookings", "Rooms", or "Payments".',
            },
            filter: {
                type: Type.OBJECT,
                description: 'A valid MongoDB filter object (e.g., {"status": "PENDING"} or {"roomType": "Standard"}). Keep it simple.',
            }
        },
        required: ['collectionName'],
    }
};


exports.handleChatQuery = async (req, res) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required.' });
        }

        const analyticsData = await analyticsService.getDashboardData();
        const summaryContext = analyticsData?.summary
            ? JSON.stringify(analyticsData.summary, null, 2)
            : 'Unavailable.';

        const systemPrompt = `
You are the advanced helpful AI Assistant for StayFlow, an intelligent hotel booking & management system.
Your job is to answer the user's questions about their hotel's analytics and performance data accurately.

Here is the current real-time analytics SUMMARY for the hotel right now:
${summaryContext}

If the user asks a general summary question, use the summary data above.
If the user asks a specific question about individual guests, bookings, rooms, or payments that isn't in the summary, you MUST use the \`queryDatabase\` tool to fetch the exact data from the database first, then answer their question based on the tool's result.

Rules:
- Be concise, direct, friendly, and helpful.
- Use markdown for formatting (e.g., tables or bold text).
- If querying the DB, summarize the results clearly for the user.
        `;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.1, 
                tools: [{ functionDeclarations: [queryDatabaseTool] }]
            }
        });
        let response = await chat.sendMessage({ message: question });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];

            if (call.name === 'queryDatabase') {

                const dbResults = await queryDatabase(call.args);


                response = await chat.sendMessage({
                    message: [{
                        functionResponse: {
                            name: 'queryDatabase',
                            response: dbResults
                        }
                    }]
                });
            }
        }

        res.json({ answer: response.text });

    } catch (error) {
        console.log('Error generating chat response:', error);
        console.log('Detailed Error:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to generate a response from the AI. Please try again.' });
    }
};
