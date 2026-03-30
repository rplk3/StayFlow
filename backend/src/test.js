require('dotenv').config({ path: '../.env' });
const { GoogleGenAI } = require('@google/genai');

async function test() {
    try {
        console.log("Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hi',
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("SDK Error:", e.name, e.message);
    }
}
test();
