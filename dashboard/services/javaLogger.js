const axios = require('axios');

async function logToJava(chatId, leadData, startTime, summary) {
    const payload = {
        chatId: String(chatId),
        name: leadData.name || '',
        phone: leadData.phone || '',
        budget: String(leadData.budget || ''),
        area: leadData.area || '',
        location: leadData.location || '',
        unitType: leadData.unit_type || '',
        heatScore: String(leadData.heat_score || ''),
        startTime: startTime || '',
        summary: summary || ''
    };

    try {
        await axios.post('http://localhost:8080/log', payload, { timeout: 1000 });
    } catch (e) {
        // Silent fail if Java server is down
        // console.error("Java logging error:", e.message);
    }
}

module.exports = { logToJava };
