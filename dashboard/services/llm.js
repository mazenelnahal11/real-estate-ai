const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const CHAT_MODEL = process.env.CHAT_MODEL || 'gemini';
const EXTRACT_MODEL = process.env.EXTRACT_MODEL || 'huggingface';

// Configure Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Helper: Query Hugging Face Inference API
 * @param {object} payload - The JSON payload to send to the API.
 * @returns {Promise<object>} The API response data.
 */
async function queryHuggingFace(payload) {
    const apiUrl = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";
    const headers = { "Authorization": `Bearer ${HUGGINGFACE_API_KEY}` };
    try {
        const response = await axios.post(apiUrl, payload, { headers });
        return response.data;
    } catch (error) {
        console.error("Hugging Face API Error:", error.message);
        return {};
    }
}

/**
 * Helper: Query Mistral AI API
 * @param {Array} messages - The messages array for the chat completion.
 * @param {string} model - The model to use (default: mistral-small-latest).
 * @returns {Promise<string>} The content of the response message.
 */
async function queryMistral(messages, model = "mistral-large-2512") {
    const apiUrl = "https://api.mistral.ai/v1/chat/completions";
    const headers = {
        "Authorization": `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json"
    };
    const payload = {
        model: model,
        messages: messages,
        temperature: 0.7
    };

    try {
        const response = await axios.post(apiUrl, payload, { headers });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Mistral API Error:", error.response ? error.response.data : error.message);
        throw new Error(`Mistral API Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
}

/**
 * Extracts structured lead data from a chat conversation.
 * @param {string} fullChat - The full chat history string.
 * @returns {Promise<object>} The extracted lead data as a JSON object.
 */
async function extractLead(fullChat) {
    const now = new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    const extractionPrompt = `
You are an AI assistant for a real estate company. From the entire chat conversation, extract the following information:

Current Date and Time: ${now}

- name: The person's name
- phone: Phone number
- budget: Budget amount as number
- location: Desired location
- compound: The compound or project name mentioned
- unit_type: Type of unit (e.g., apartment, house)
- area: Size of the unit in sqm (if mentioned)
- call_requested: Boolean (true/false) if the user explicitly asked for a call or agreed to one. Set this to true even if no time is specified.
- best_call_time: The preferred time for the call **IF AND ONLY IF** the user explicitly mentioned a specific time or day. Convert relative times (like "tomorrow at 3pm") to absolute format: "Day, YYYY-MM-DD at HH:MM AM/PM". **If the user did NOT specify a time, this field MUST be null. Do NOT assume "now" or "ASAP".**
- tonality: The sentiment/tone of the user. Must be one of: "Positive", "Neutral", "Negative", "Urgent".
- heat_score: null (This will be calculated by an external algorithm).

Output only a valid JSON object with keys: name, phone, budget, area, location, compound, unit_type, urgency, language, tonality, call_requested, best_call_time. Use null for missing fields.

Chat conversation: ${fullChat}
`;

    try {
        let output = "";
        if (EXTRACT_MODEL === 'gemini') {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await model.generateContent(extractionPrompt);
            const response = await result.response;
            output = response.text().trim();
            // Clean markdown
            if (output.startsWith("```json")) output = output.slice(7, -3);
            else if (output.startsWith("```")) output = output.slice(3, -3);
        } else if (EXTRACT_MODEL === 'huggingface') {
            const payload = {
                inputs: `[INST] ${extractionPrompt} [/INST]`,
                parameters: { max_new_tokens: 500, return_full_text: false }
            };
            const response = await queryHuggingFace(payload);
            if (Array.isArray(response) && response[0].generated_text) {
                output = response[0].generated_text.trim();
            } else {
                output = "{}";
            }
        } else if (EXTRACT_MODEL === 'mistral') {
            output = await queryMistral([{ role: "user", content: extractionPrompt }]);
            // Clean markdown if present
            output = output.trim();
            if (output.startsWith("```json")) output = output.slice(7, -3);
            else if (output.startsWith("```")) output = output.slice(3, -3);
        } else {
            return {};
        }

        return JSON.parse(output);
    } catch (e) {
        console.error("Error in extractLead:", e);
        return {};
    }
}

/**
 * Generates a brief summary of the chat conversation.
 * @param {string} fullChat - The full chat history string.
 * @returns {Promise<string>} A 1-2 sentence summary.
 */
async function generateSummary(fullChat) {
    const summaryPrompt = `
Summarize the following real estate chat conversation in strictly English.
Constraints:
- Maximum 30 words.
- Compact and to the point.
- Professional and objective tone.
- NO MARKDOWN formatting allowed (no bold, no lists, no italics). Plain text only.

Chat conversation: ${fullChat}
`;
    try {
        if (EXTRACT_MODEL === 'gemini') {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await model.generateContent(summaryPrompt);
            const response = await result.response;
            return response.text().trim().replace(/[*_#`]/g, ''); // Extra safety to strip markdown
        } else if (EXTRACT_MODEL === 'huggingface') {
            const payload = {
                inputs: `[INST] ${summaryPrompt} [/INST]`,
                parameters: { max_new_tokens: 150, return_full_text: false }
            };
            const response = await queryHuggingFace(payload);
            if (Array.isArray(response) && response[0].generated_text) {
                return response[0].generated_text.trim().replace(/[*_#`]/g, '');
            } else {
                return "Summary unavailable.";
            }
        } else if (EXTRACT_MODEL === 'mistral') {
            const res = await queryMistral([{ role: "user", content: summaryPrompt }]);
            return res.trim().replace(/[*_#`]/g, '');
        } else {
            return "Configuration error.";
        }
    } catch (e) {
        console.error("Error in generateSummary:", e);
        return "Error generating summary.";
    }
}

/**
 * @param {string} message - The user's latest message.
 * @param {Array<object>} compounds - List of available compounds/projects.
 * @param {Array<string>} chatHistory - Recent chat history.
 * @returns {Promise<string>} The AI's response.
 */
async function generateResponse(message, compounds, chatHistory = []) {
    const historyText = chatHistory.length > 0 ? chatHistory.join('\n') : "No previous history.";

    const responsePrompt = `
You are a real estate assistant. Respond to the client's latest message, considering the conversation context.

Conversation History (Last few messages):
${historyText}

Latest message: ${message}

Available compounds information: ${JSON.stringify(compounds)}

Instructions:
1. **Context**: Use the conversation history to maintain continuity (e.g., remember their name, budget, or previous questions).
2. **Style**: Compact, professional but casual. Like a text message. **Max 2-3 sentences**.
3. **Language**: Match the client's language/dialect (Egyptian Arabic if applicable).
4. **Formatting**: **NO MARKDOWN AT ALL**. No bold (**), no lists, no headers. Plain text only.
5. **Data Usage**: 
   - **DO NOT dump all the data at once**. 
   - If the client asks about a project, start by confirming availability and asking a follow-up. 
   - *Example*: "Yes, we have units in Badya. Are you interested in a Villa or an Apartment?"
   - Only provide specific details (price, payment plan) if explicitly asked or relevant to the flow.
6. **Goal**: Qualify the lead (Budget, Location, Unit Type) naturally over multiple turns.
7. **Call Booking**: Always try to steer the conversation towards booking a call.

Remember: You are having a conversation, not reading a brochure. Keep it natural.
`;

    try {
        if (CHAT_MODEL === 'gemini') {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await model.generateContent(responsePrompt);
            const response = await result.response;
            return response.text().trim();
        } else if (CHAT_MODEL === 'huggingface') {
            const payload = {
                inputs: `[INST] ${responsePrompt} [/INST]`,
                parameters: { max_new_tokens: 500, return_full_text: false }
            };
            const response = await queryHuggingFace(payload);
            if (Array.isArray(response) && response[0].generated_text) {
                return response[0].generated_text.trim();
            } else {
                return "I'm having trouble connecting right now. Please try again.";
            }
        } else if (CHAT_MODEL === 'mistral') {
            return await queryMistral([{ role: "user", content: responsePrompt }]);
        } else {
            return "Configuration error: Unknown CHAT_MODEL.";
        }
    } catch (e) {
        console.error("Error in generateResponse:", e);
        return `An error occurred while generating response: ${e.message}`;
    }
}

module.exports = { extractLead, generateSummary, generateResponse };
