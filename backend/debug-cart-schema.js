const { sequelize } = require('./models');

async function checkCartSchema() {
    try {
        const [results] = await sequelize.query('DESCRIBE `Carts`;');
        console.table(results);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        sequelize.close();
    }
}

checkCartSchema();
