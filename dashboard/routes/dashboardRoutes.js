const express = require('express');
const router = express.Router();
const moment = require('moment');
const crypto = require('crypto');
const path = require('path');
const db = require('../config/db');
const chartService = require('../services/chartService');
const LeadService = require('../services/leadService');
const PdfService = require('../services/pdfService');

/**
 * Helper: Get Start of Week
 * @returns {string} Formatted date string for the start of the current ISO week.
 */
function getStartOfWeek() {
    return moment().startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
}

// --- Routes ---

/**
 * GET /
 * Login Page
 */
router.get('/', (req, res) => {
    if (req.cookies.auth === 'true') {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

/**
 * POST /login
 * Handle Login Logic
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Hardcoded credentials for simplicity as per requirements
    if (username === 'mazenelnahal' && password === '1234') {
        res.cookie('auth', 'true', { maxAge: 900000, httpOnly: true }); // 15 minutes
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Invalid credentials' });
    }
});

/**
 * GET /logout
 * Clear auth cookie and redirect to login
 */
router.get('/logout', (req, res) => {
    res.clearCookie('auth');
    res.redirect('/');
});

/**
 * GET /dashboard
 * Main Dashboard View
 */
router.get('/dashboard', async (req, res) => {
    if (req.cookies.auth !== 'true') {
        return res.redirect('/');
    }

    try {
        const metrics = await LeadService.getDashboardMetrics();
        res.render('dashboard', {
            ...metrics,
            moment: moment
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

/**
 * GET /api/dashboard-stats
 * Fetch real-time dashboard metrics
 */
router.get('/api/dashboard-stats', async (req, res) => {
    if (req.cookies.auth !== 'true') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { startDate, endDate, page } = req.query;
        const metrics = await LeadService.getDashboardMetrics({ startDate, endDate, page });
        res.json(metrics);
    } catch (err) {
        console.error("Stats API Error:", err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

/**
 * GET /api/chart-data
 * Fetch chart data for frontend
 */
router.get('/api/chart-data', async (req, res) => {
    if (req.cookies.auth !== 'true') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const chartData = await chartService.getHourlyHeatScore(db);
        res.json(chartData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

/**
 * GET /api/interaction/:chatId
 * Fetch detailed interaction data (metadata ONLY - Chat History Removed)
 */
router.get('/api/interaction/:chatId', async (req, res) => {
    if (req.cookies.auth !== 'true') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { chatId } = req.params;
        const lead = await LeadService.getLeadByChatId(chatId);

        if (!lead) {
            return res.status(404).json({ error: 'Interaction not found' });
        }

        res.json({ lead }); // Return only lead data
    } catch (err) {
        console.error("Interaction Details Error:", err);
        res.status(500).json({ error: 'Failed to fetch interaction details' });
    }
});

/**
 * GET /seed
 * Seed Database with Dummy Data
 */
router.get('/seed', (req, res) => {
    if (req.cookies.auth !== 'true') return res.redirect('/');

    const dummyLeads = [];

    // Generate leads for the last 24 hours to populate the chart
    for (let i = 0; i < 24; i++) {
        dummyLeads.push({
            name: `Test Lead ${i}`,
            phone: `+1555${Math.floor(100000 + Math.random() * 900000)}`,
            budget: (500000 + Math.floor(Math.random() * 1000000)).toString(),
            heat_score: Math.floor(Math.random() * 100), // Random score 0-100
            summary: `Auto-generated test lead for ${i} hours ago.`,
            start_time: moment().subtract(i, 'hours').format('YYYY-MM-DD HH:mm:ss')
        });
    }

    // Add a few high value leads
    dummyLeads.push(
        { name: 'Sarah Connor', phone: '+1234567890', budget: '1500000', heat_score: 95, summary: 'Looking for a 3-bedroom apartment in downtown.', start_time: moment().subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:ss') },
        { name: 'John Wick', phone: '+1987654321', budget: '5000000', heat_score: 98, summary: 'Urgent need for a secluded villa.', start_time: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss') }
    );

    const stmt = db.prepare("INSERT INTO leads (chat_id, name, phone, budget, heat_score, summary, start_time) VALUES (?, ?, ?, ?, ?, ?, ?)");

    dummyLeads.forEach(lead => {
        stmt.run(crypto.randomUUID(), lead.name, lead.phone, lead.budget, lead.heat_score, lead.summary, lead.start_time);
    });

    stmt.finalize();
    res.redirect('/dashboard');
});

/**
 * GET /download-pdf
 * Generate and Download PDF Report
 */
router.get('/download-pdf', async (req, res) => {
    if (req.cookies.auth !== 'true') {
        return res.redirect('/');
    }

    try {
        const filters = req.query;
        const leads = await LeadService.getLeads(filters);
        PdfService.generateReport(res, leads, filters, filters.format);
    } catch (err) {
        console.error("PDF Generation Error:", err);
        res.status(500).send("Error generating report");
    }
});

module.exports = router;
