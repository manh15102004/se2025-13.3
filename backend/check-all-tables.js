const sequelize = require('./config/database');

async function checkAllTables() {
    try {
        const [results] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

        console.log('\n=== Database Tables Status ===');
        results.forEach(row => {
            console.log(`${row.TABLE_NAME}: ${row.TABLE_ROWS} rows`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAllTables();
