const { User, sequelize } = require('./models');

async function getUser() {
    const user = await User.findByPk(1);
    console.log('User 1 Email:', user ? user.email : 'NOT FOUND');
    await sequelize.close();
}

getUser();
