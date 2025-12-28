/**
 * Service to calculate Lead Heat Score deterministically.
 * 
 * Formula:
 * Score = Base(20) + Qualifiers + Tonality + ResponseTime + CallIntent
 * 
 * Weights:
 * - Phone Number: +25 (Critical)
 * - Name: +5
 * - Budget: +10
 * - Location: +10
 * - Unit Type: +10
 * 
 * Tonality:
 * - Urgent: +25
 * - Positive: +10
 * - Negative: -10
 * 
 * Response Time (Lead speed):
 * - < 30s: +10
 * - < 2m: +5
 * - > 1h: -5
 * - First message: 0
 * 
 * Call Requested: +20
 */

class ScoreService {
    /**
     * @param {object} leadData - JSON extracted by LLM
     * @param {number|null} responseTimeSec - Seconds taken by lead to reply (since last bot msg)
     * @returns {number} Integer 0-100
     */
    calculateScore(leadData, responseTimeSec = null) {
        let score = 20; // Base presence

        // 1. Qualifiers
        if (leadData.phone && leadData.phone !== 'null') score += 25;
        if (leadData.name && leadData.name !== 'null') score += 5;
        if (leadData.budget && leadData.budget !== 'null') score += 10;
        if (leadData.location && leadData.location !== 'null') score += 10;
        if (leadData.unit_type && leadData.unit_type !== 'null') score += 10;

        // 2. Tonality (from LLM)
        const tone = (leadData.tonality || 'Neutral').toLowerCase();
        if (tone === 'urgent') score += 25;
        else if (tone === 'positive') score += 10;
        else if (tone === 'negative') score -= 10;

        // 3. Response Time
        // responseTimeSec: how long the USER took to reply to the BOT.
        // If it's the first message, responseTimeSec might be null or 0.
        if (responseTimeSec !== null && responseTimeSec > 0) {
            if (responseTimeSec < 30) score += 10;      // Super engaged
            else if (responseTimeSec < 120) score += 5; // Engaged
            else if (responseTimeSec > 3600) score -= 5;// Slow
        }

        // 4. Explicit Call Intent
        if (leadData.call_requested) score += 20;

        // 5. Budget Bonus (High Value)
        // If budget > 5M, add bonus
        const budgetVal = parseInt(String(leadData.budget || '0').replace(/[^0-9]/g, ''));
        if (budgetVal > 5000000) score += 10;

        return Math.min(Math.max(Math.round(score), 0), 100);
    }
}

module.exports = new ScoreService();
