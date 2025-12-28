const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const DATA_SHEET_ID = process.env.DATA_SHEET_ID;
const COMPOUNDS_SHEET_ID = process.env.COMPOUNDS_SHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || '../credentials.json';

// Initialize Auth
const creds = require(path.resolve(__dirname, '..', CREDENTIALS_PATH));
const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

let compounds = [];

/**
 * Retrieves compound data from the Google Sheet.
 * Caches the result in memory after the first fetch.
 * @returns {Promise<Array<object>>} List of compound objects.
 */
async function getCompounds() {
    if (compounds.length > 0) return compounds;

    if (!COMPOUNDS_SHEET_ID) return [];

    try {
        const doc = new GoogleSpreadsheet(COMPOUNDS_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['compounds']; // Assuming sheet name
        if (!sheet) return [];

        const rows = await sheet.getRows();
        compounds = rows.map(row => row.toObject());
        return compounds;
    } catch (e) {
        console.error("Error getting compounds:", e);
        return [];
    }
}

/**
 * Saves or updates lead data in the Google Sheet.
 * @param {string} chatId - The unique chat identifier.
 * @param {object} leadData - The extracted lead data.
 * @param {string} startTime - The start time of the chat session.
 * @param {string} summary - The chat summary.
 * @returns {Promise<void>}
 */
async function saveLead(chatId, leadData, startTime, summary) {
    if (!DATA_SHEET_ID) return;

    try {
        const doc = new GoogleSpreadsheet(DATA_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        let sheet = doc.sheetsByTitle['data'];

        if (!sheet) {
            // Create sheet if missing (or handle error)
            console.error("Data sheet not found");
            return;
        }

        // Check headers
        await sheet.loadHeaderRow();
        console.log("Sheet Headers:", sheet.headerValues);

        const rowData = {
            'Chat ID': String(chatId),
            'Name': leadData.name || '',
            'Phone': leadData.phone || '',
            'Budget': leadData.budget || '',
            'Area': leadData.area || '',
            'Location': leadData.location || '',
            'Unit Type': leadData.unit_type || '',
            'Heat Scoring': leadData.heat_score || '',
            'Time Stamp': startTime || '',
            'Chat Summary': summary || '',
            'Call Requested Y/N': leadData.call_requested ? 'Yes' : 'No',
            'Call Time': leadData.best_call_time || ''
        };

        // Check for existing row
        const rows = await sheet.getRows();
        const existingRow = rows.find(row => row.get('Chat ID') === String(chatId));

        if (existingRow) {
            existingRow.assign(rowData);
            await existingRow.save();
            console.log(`Updated row for chat_id ${chatId}`);
        } else {
            await sheet.addRow(rowData);
            console.log(`Appended new row for chat_id ${chatId}`);
        }

    } catch (e) {
        console.error("Error saving to sheet:", e);
    }
}

module.exports = { getCompounds, saveLead };
