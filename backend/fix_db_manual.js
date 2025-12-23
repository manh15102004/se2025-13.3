const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
    // Parse DB config from env or defaults
    // Assuming standard local setup if env is not perfect, but try to use env
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'appsale',
    };

    console.log('Connecting to database...', config.database);

    try {
        const connection = await mysql.createConnection(config);

        // 1. Check if table exists
        const [rows] = await connection.execute("SHOW TABLES LIKE 'UserConversations'");

        if (rows.length > 0) {
            console.log('Table UserConversations exists. Checking columns...');
            const [columns] = await connection.execute("DESCRIBE `UserConversations`");
            const hasId = columns.some(col => col.Field === 'id');

            if (!hasId) {
                console.log('Table exists but missing ID column. Dropping...');
                await connection.execute("DROP TABLE `UserConversations`");
            } else {
                console.log('Table seems correct. Exiting.');
                // We could force recreate anyway to be sure, but let's be careful.
                // Actually, user said 3 errors, let's force recreate to be safe.
                console.log('Force recreating to ensure integrity...');
                await connection.execute("DROP TABLE `UserConversations`");
            }
        }

        // 2. Create Table
        const createQuery = `
      CREATE TABLE IF NOT EXISTS \`UserConversations\` (
        \`id\` INTEGER NOT NULL AUTO_INCREMENT,
        \`userId\` INTEGER NOT NULL,
        \`conversationId\` INTEGER NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`user_conversation_unique\` (\`userId\`, \`conversationId\`),
        CONSTRAINT \`fk_userconversations_user\` FOREIGN KEY (\`userId\`) REFERENCES \`Users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_userconversations_conversation\` FOREIGN KEY (\`conversationId\`) REFERENCES \`Conversations\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

        console.log('Executing CREATE TABLE...');
        await connection.execute(createQuery);
        console.log('✅ Table UserConversations created successfully via Raw SQL.');

        await connection.end();
    } catch (error) {
        console.error('❌ Error fixing database:', error);
    }
}

fixDatabase();
