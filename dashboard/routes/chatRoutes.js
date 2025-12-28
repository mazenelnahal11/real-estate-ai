const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const moment = require('moment');
const db = require('../config/db');

// Services
const llm = require('../services/llm');
const sheets = require('../services/sheets');
const javaLogger = require('../services/javaLogger');
const scoreService = require('../services/scoreService');

/**
 * GET /chat
 * Render Chat Interface
 */
router.get('/', (req, res) => {
    res.render('chat');
});

/**
 * POST /chat/message
 * Handle Chat Messages
 */
router.post('/message', async (req, res) => {
    const userMessage = req.body.message;
    // Prioritize Client-Side ID (from sessionStorage), fallback to cookie
    let chatId = req.body.chatId || req.cookies.chat_id;

    // Initialize global session trackers if needed
    if (!global.chatHistories) global.chatHistories = {};
    if (!global.chatSessions) global.chatSessions = {};
    if (!global.lastTurnTime) global.lastTurnTime = {};

    // Validate or Generate Chat ID
    if (!chatId || chatId.length > 8) { // Allow up to 8 chars (client generates 6-char base36)
        chatId = crypto.randomBytes(3).toString('hex').toUpperCase();
    }

    // Determine Start Time
    let startTime = global.chatSessions[chatId];
    if (!startTime) {
        startTime = moment().format('YYYY-MM-DD HH:mm:ss');
        global.chatSessions[chatId] = startTime;

        // Set cookies as backup/legacy support
        res.cookie('chat_id', chatId, { maxAge: 86400000, httpOnly: true });
        res.cookie('chat_start_time', startTime, { maxAge: 86400000, httpOnly: true });
    }

    // Initialize chat history
    if (!global.chatHistories[chatId]) global.chatHistories[chatId] = [];

    global.chatHistories[chatId].push(`User: ${userMessage}`);
    const fullChat = global.chatHistories[chatId].join('\n');

    // Calculate Response Time (Time since last interaction)
    const nowTs = moment().valueOf();
    let responseTimeSec = 0;
    if (global.lastTurnTime[chatId]) {
        responseTimeSec = (nowTs - global.lastTurnTime[chatId]) / 1000;
    }
    // Update lastTurnTime will happen after processing (or roughly now)
    global.lastTurnTime[chatId] = nowTs;

    try {
        // 1. Get Compounds (Context)
        const compounds = await sheets.getCompounds();

        // 2. Generate Response from LLM
        // Extract recent history (excluding the latest message which is passed separately)
        // Get last 6 messages before the current one to give context of ~3 exchanges
        const recentHistory = global.chatHistories[chatId].slice(0, -1).slice(-6);
        const reply = await llm.generateResponse(userMessage, compounds, recentHistory);
        global.chatHistories[chatId].push(`Assistant: ${reply}`);

        // 3. Extract Lead Data
        const leadData = await llm.extractLead(fullChat);

        // 3.5 Calculate Deterministic Score
        const calculatedScore = scoreService.calculateScore(leadData, responseTimeSec);
        leadData.heat_score = calculatedScore;
        console.log(`[Score Service] Chat ${chatId}: Score=${calculatedScore} (Time=${responseTimeSec.toFixed(1)}s, Tone=${leadData.tonality})`);

        // 4. Generate Summary
        const summary = await llm.generateSummary(fullChat);

        // 5. Log to Sheets
        await sheets.saveLead(chatId, leadData, startTime, summary);

        // 6. Log to Java Service (Legacy/Backup)
        await javaLogger.logToJava(chatId, leadData, startTime, summary);

        // 7. Log Directly to SQLite (Primary Reliability)
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO leads (chat_id, name, phone, budget, heat_score, summary, start_time, area, location, unit_type, call_requested, best_call_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            chatId,
            leadData.name || null,
            leadData.phone || null,
            leadData.budget ? String(leadData.budget) : null,
            leadData.heat_score ? String(leadData.heat_score) : null,
            summary || null,
            startTime,
            leadData.area || null,
            leadData.location || null,
            leadData.unit_type || null,
            leadData.call_requested ? 1 : 0,
            leadData.best_call_time || null,
            (err) => {
                if (err) console.error("SQLite Direct Log Error:", err.message);
                else console.log(`Logged chat ${chatId} to SQLite directly.`);
            }
        );
        stmt.finalize();

        // 8. Log Full Transcript REMOVED as per request

        res.json({ reply });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            details: error.toString()
        });
    }
});

/**
 * POST /chat/clear
 * Clear Chat History and Cookies
 */
router.post('/clear', (req, res) => {
    const chatId = req.body.chatId || req.cookies.chat_id;

    if (chatId) {
        if (global.chatHistories) delete global.chatHistories[chatId];
        if (global.chatSessions) delete global.chatSessions[chatId];
    }

    res.clearCookie('chat_id');
    res.clearCookie('chat_start_time');
    res.json({ success: true });
});

module.exports = router;
