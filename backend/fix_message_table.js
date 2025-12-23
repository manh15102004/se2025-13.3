const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixMessageTable() {
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
        // Note: Sequelize usually pluralizes table names. Model is 'Message', table is 'Messages'.
        const [columns] = await connection.execute("DESCRIBE `Messages`");
        console.log('Current columns in Messages:', columns.map(c => c.Field).join(', '));

        const hasReceiverId = columns.some(col => col.Field === 'receiverId');

        if (!hasReceiverId) {
            console.log('receiverId column is missing. Adding it...');

            // Add column
            await connection.execute(`
        ALTER TABLE \`Messages\`
        ADD COLUMN \`receiverId\` INTEGER DEFAULT NULL
      `);
            console.log('Added receiverId column.');

            // Add Foreign Key (optional but good practice)
            // We need to be careful with existing data constraints, but since it's nullable it's fine.
            try {
                await connection.execute(`
          ALTER TABLE \`Messages\`
          ADD CONSTRAINT \`fk_messages_receiver\`
          FOREIGN KEY (\`receiverId\`) REFERENCES \`Users\` (\`id\`)
          ON DELETE SET NULL ON UPDATE CASCADE
        `);
                console.log('Added Foreign Key constraint for receiverId.');
            } catch (fkError) {
                console.log('Could not add FK (maybe Users table issues or mismatch types), but column was added.', fkError.message);
            }

        } else {
            console.log('receiverId column already exists.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error fixing Message table:', error);
    }
}

fixMessageTable();
