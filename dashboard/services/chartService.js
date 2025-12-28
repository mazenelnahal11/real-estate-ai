const moment = require('moment');

/**
 * Service to handle chart data retrieval and processing
 */
const chartService = {
    /**
     * Get hourly average heat score for the last 24 hours
     * @param {Object} db - SQLite database instance
     * @returns {Promise<Object>} - { labels: [], data: [] }
     */
    getHourlyHeatScore: (db) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT strftime('%H', start_time) as hour, AVG(CAST(heat_score AS INTEGER)) as avgScore
                FROM leads
                WHERE start_time >= datetime('now', '-24 hours')
                GROUP BY strftime('%H', start_time)
                ORDER BY hour ASC
            `;

            db.all(query, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching chart data:', err);
                    return reject(err);
                }

                const labels = [];
                const data = [];

                // Generate last 24 hours labels and map data
                for (let i = 23; i >= 0; i--) {
                    const d = moment().subtract(i, 'hours');
                    const hourStr = d.format('HH'); // 00-23
                    labels.push(d.format('h a')); // 12 pm

                    // Find matching data or 0
                    const match = rows.find(r => r.hour === hourStr);
                    data.push(match ? Math.round(match.avgScore) : 0);
                }

                resolve({ labels, data });
            });
        });
    }
};

module.exports = chartService;
