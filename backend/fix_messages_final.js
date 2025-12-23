const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixMessageTableFinal() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'appsale',
    };

    console.log('Connecting to database...', config.database);

    try {
        const connection = await mysql.createConnection(config);

        // Check columns in Messages table
        const [columns] = await connection.execute("DESCRIBE `Messages`");
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns in Messages:', columnNames.join(', '));

        // Check for conversationId
        if (!columnNames.includes('conversationId')) {
            console.log('conversationId column is missing. Adding it...');
            await connection.execute(`
        ALTER TABLE \`Messages\`
        ADD COLUMN \`conversationId\` INTEGER NOT NULL AFTER \`receiverId\`
      `);
            console.log('Added conversationId column.');

            // Add FK
            try {
                await connection.execute(`
          ALTER TABLE \`Messages\`
          ADD CONSTRAINT \`fk_messages_conversation\`
          FOREIGN KEY (\`conversationId\`) REFERENCES \`Conversations\` (\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
                console.log('Added Foreign Key constraint for conversationId.');
            } catch (fkError) {
                console.log('Could not add FK (maybe Conversations table issues), but column was added.', fkError.message);
            }
        } else {
            console.log('conversationId exists.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error fixing Message table:', error);
    }
}

fixMessageTableFinal();
