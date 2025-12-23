const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'appsale_db',
};

async function fixAvatarColumn() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Check if column exists and alter it
        const query = `ALTER TABLE Users MODIFY COLUMN avatar LONGTEXT;`;
        console.log('Executing:', query);

        await connection.execute(query);
        console.log('Successfully changed avatar column to LONGTEXT.');

    } catch (error) {
        console.error('Error fixing avatar column:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixAvatarColumn();
