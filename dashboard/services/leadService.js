const db = require('../config/db');

/**
 * LeadService
 * Handles database operations related to leads.
 */
class LeadService {
    /**
     * Fetch leads based on filter criteria.
     * @param {Object} filters - Filtering options.
     * @param {number} [filters.minHeatScore] - Minimum heat score.
     * @param {boolean} [filters.fullDataOnly] - If true, only return leads with name, phone, and budget.
     * @param {boolean} [filters.summaryOnly] - If true, only return leads with a summary.
     * @param {boolean} [filters.callRequestedOnly] - If true, only return leads where a call was requested.
     * @param {string} [filters.startDate] - Start date (YYYY-MM-DD).
     * @param {string} [filters.endDate] - End date (YYYY-MM-DD).
     * @returns {Promise<Array>} List of leads.
     */
    static getLeads(filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM leads WHERE 1=1";
            const params = [];

            if (filters.minHeatScore) {
                sql += " AND CAST(heat_score AS INTEGER) >= ?";
                params.push(parseInt(filters.minHeatScore));
            }

            if (filters.fullDataOnly === 'on' || filters.fullDataOnly === true) {
                sql += " AND name IS NOT NULL AND name != '' AND phone IS NOT NULL AND phone != '' AND budget IS NOT NULL AND budget != ''";
            }

            if (filters.summaryOnly === 'on' || filters.summaryOnly === true) {
                sql += " AND summary IS NOT NULL AND summary != ''";
            }

            if (filters.callRequestedOnly === 'on' || filters.callRequestedOnly === true) {
                sql += " AND call_requested = 1";
            }

            if (filters.startDate) {
                sql += " AND start_time >= ?";
                params.push(filters.startDate + " 00:00:00");
            }

            if (filters.endDate) {
                sql += " AND start_time <= ?";
                params.push(filters.endDate + " 23:59:59");
            }

            sql += " ORDER BY start_time DESC";

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Get dashboard metrics.
     * @returns {Promise<Object>} Dashboard metrics.
     */
    static getDashboardMetrics(filters = {}) {
        return new Promise((resolve, reject) => {
            const queries = {
                totalLeads: "SELECT COUNT(*) as count FROM leads",
                totalPipeline: "SELECT SUM(CAST(replace(replace(budget, '$', ''), ',', '') AS INTEGER)) as revenue FROM leads",
                hotLeads: "SELECT COUNT(*) as count FROM leads WHERE CAST(heat_score AS INTEGER) > 75",
                avgHeatScore: "SELECT AVG(CAST(heat_score AS INTEGER)) as avgScore FROM leads",
            };

            const metrics = {};

            db.serialize(() => {
                db.get(queries.totalLeads, [], (err, row) => {
                    if (err) return reject(err);
                    metrics.totalLeads = row.count;

                    db.get(queries.totalPipeline, [], (err, row) => {
                        if (err) return reject(err);
                        metrics.projectedRevenue = row.revenue || 0;

                        db.get(queries.hotLeads, [], (err, row) => {
                            if (err) return reject(err);
                            metrics.hotLeads = row.count || 0;

                            db.get(queries.avgHeatScore, [], (err, row) => {
                                if (err) return reject(err);
                                metrics.avgHeatScore = Math.round(row.avgScore || 0);

                                // --- Pagination & Filtering Logic ---
                                const page = parseInt(filters.page) || 1;
                                const limit = parseInt(filters.limit) || 10;
                                const offset = (page - 1) * limit;

                                let baseSql = "FROM leads WHERE 1=1";
                                const queryParams = [];

                                if (filters.startDate) {
                                    baseSql += " AND start_time >= ?";
                                    queryParams.push(filters.startDate + " 00:00:00");
                                }

                                if (filters.endDate) {
                                    baseSql += " AND start_time <= ?";
                                    queryParams.push(filters.endDate + " 23:59:59");
                                }

                                const countSql = "SELECT COUNT(*) as count " + baseSql;
                                const dataSql = "SELECT * " + baseSql + " ORDER BY start_time DESC LIMIT ? OFFSET ?";

                                db.get(countSql, queryParams, (err, countRow) => {
                                    if (err) return reject(err);

                                    const totalCount = countRow.count;
                                    const totalPages = Math.ceil(totalCount / limit);

                                    // Add limit/offset to params for data query
                                    const dataParams = [...queryParams, limit, offset];

                                    db.all(dataSql, dataParams, (err, rows) => {
                                        if (err) return reject(err);

                                        metrics.recentChats = rows;
                                        metrics.pagination = {
                                            page: page,
                                            limit: limit,
                                            totalPages: totalPages,
                                            totalCount: totalCount
                                        };
                                        resolve(metrics);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Get a single lead by Chat ID.
     * @param {string} chatId 
     * @returns {Promise<Object>} Lead data.
     */
    static getLeadByChatId(chatId) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM leads WHERE chat_id = ?";
            db.get(sql, [chatId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

module.exports = LeadService;
