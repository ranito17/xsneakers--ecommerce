// dbSingleton.js
const mysql = require('mysql2/promise');
const config = require('./config');

// חיבור יחיד לבסיס הנתונים - Singleton Pattern
let connection;

const dbSingleton = {
    // פונקציה לקבלת חיבור לבסיס הנתונים
    // משתמשת ב-Promise mode של mysql2 במקום callback mode
    getConnection: async () => {
        if (!connection) {
            try {
                // יצירת חיבור חדש לבסיס הנתונים
                //Promise mode מטעמי פיתוח
                // Promise mode מאפשר שימוש ב-async/await במקום callbacks
                connection = await mysql.createConnection({
                    host: config.database.host,
                    user: config.database.user,
                    password: config.database.password,
                    database: config.database.database,
                    // Valid MySQL2 connection options
                    connectTimeout: 60000
                });
                console.log('Connected to MySQL (promise mode)');
                console.log(`Database: ${config.database.database} on ${config.database.host}`);
                
                // Handle connection errors
                connection.on('error', (err) => {
                    console.error('Database connection error:', err);
                    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                        console.log('Database connection was closed. Reconnecting...');
                        connection = null;
                    } else {
                        throw err;
                    }
                });
                
            } catch (error) {
                console.error('Failed to connect to database:', error);
                console.error('Database config:', {
                    host: config.database.host,
                    user: config.database.user,
                    database: config.database.database
                });
                throw error;
            }
        }
        return connection;
    },
    
    // Function to close the connection
    closeConnection: async () => {
        if (connection) {
            await connection.end();
            connection = null;
            console.log('Database connection closed');
        }
    }
};

module.exports = dbSingleton;

