require('dotenv').config();
const { Pool } = require('pg');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'eduinfo',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

// Create pool instance
const pool = new Pool(dbConfig);

// Error handler
pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('Database query error:', { text, error: error.message });
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
    const client = await pool.connect();
    const originalQuery = client.query.bind(client);
    const originalRelease = client.release.bind(client);

    // Set a timeout for transactions
    const timeout = setTimeout(() => {
        console.error('Client has been checked out for more than 5 seconds');
    }, 5000);

    // Monkey-patch release to clear timeout
    client.release = () => {
        clearTimeout(timeout);
        client.query = originalQuery;
        client.release = originalRelease;
        return originalRelease();
    };

    return client;
}

/**
 * End the pool (for graceful shutdown)
 */
async function end() {
    await pool.end();
}

module.exports = {
    query,
    getClient,
    end,
    pool
};
