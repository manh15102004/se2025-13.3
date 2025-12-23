const { sequelize } = require('./models');

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Raw SQL to add column if it doesn't exist
        // Note: Sequelize "alter: true" should handle this, but manual script is safer if sync fails
        try {
            await sequelize.query(`
            ALTER TABLE Banners
            ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
        `);
            console.log('✅ Added "price" column to Banners table');
        } catch (err) {
            if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column "price" already exists.');
            } else {
                console.error('⚠️ Error adding column:', err.message);
            }
        }

    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await sequelize.close();
    }
};

migrate();
