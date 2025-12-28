const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Establishes a connection to the SQLite database.
 * @returns {sqlite3.Database} The database connection object.
 */
const connectDB = () => {
    const dbPath = path.resolve(__dirname, '../../leads.db');
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the leads database.');
        }
    });
    return db;
};

const db = connectDB();

module.exports = db;
