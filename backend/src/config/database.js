const mysql = require('mysql2/promise');
const config = require('./config');

let pool = null;

const createPool = async () => {
    const createdPool = mysql.createPool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        connectTimeout: 60000,
        charset: 'utf8mb4',
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
        queueLimit: 0
    });

    // Validate pool early (helps fail fast on bad credentials)
    const testConn = await createdPool.getConnection();
    try {
        await testConn.ping();
    } finally {
        testConn.release();
    }

    console.log('Connected to MySQL (pool)');
    console.log(`Database: ${config.database.database} on ${config.database.host}`);

    return createdPool;
};

const dbSingleton = {
    getPool: async () => {
        try {
            if (!pool) {
                pool = await createPool();
            }

            return pool;
        } catch (error) {
            console.error('Failed to connect to database:', error);
            console.error('Database config:', {
                host: config.database.host,
                user: config.database.user,
                database: config.database.database
            });
            throw error;
        }
    },

    // Backward-compatible alias for older code paths that call getConnection()
    getConnection: async () => {
        return await dbSingleton.getPool();
    },

    // Dedicated connection for transaction-heavy flows.
    // Comes from the pool; callers MUST release() it.
    getDedicatedConnection: async () => {
        const p = await dbSingleton.getPool();
        return await p.getConnection();
    },

    closeConnection: async () => {
        if (pool) {
            await pool.end();
            pool = null;
            console.log('Database pool closed');
        }
    }
};

module.exports = dbSingleton;