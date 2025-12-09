require('dotenv').config();
const { User } = require('./models');

async function resetPassword() {
    try {
        const email = 'pdm10a2@gmail.com';
        const newPassword = '123456';

        console.log(`Resetting password for ${email}...`);

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        user.password = newPassword;
        await user.save();

        console.log('✓ Password reset successfully!');
        console.log(`Email: ${email}`);
        console.log(`New Password: ${newPassword}`);

        // Test the new password
        const isMatch = await user.matchPassword(newPassword);
        console.log(`\nPassword verification: ${isMatch ? '✓ Working' : '✗ Failed'}`);

    } catch (error) {
        console.error('Error:', error.message);
    }

    process.exit(0);
}

resetPassword();
