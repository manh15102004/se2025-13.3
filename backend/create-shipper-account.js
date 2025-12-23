require('dotenv').config();
const { User } = require('./models');

async function createShipperAccount() {
    try {
        // Xóa tài khoản cũ nếu có
        await User.destroy({ where: { email: 'shipper@test.com' } });

        // Tạo tài khoản mới - KHÔNG hash password vì User model sẽ tự hash
        const shipper = await User.create({
            email: 'shipper@test.com',
            password: '123456', // Raw password - User model sẽ tự hash
            fullName: 'Nguyễn Văn Shipper',
            phone: '0987654321',
            role: 'shipper',
            address: 'Hà Nội'
        });

        console.log('✅ Tạo tài khoản shipper thành công!');
        console.log('');
        console.log('📧 Email: shipper@test.com');
        console.log('🔑 Password: 123456');
        console.log('👤 Role: shipper');
        console.log('🆔 ID:', shipper.id);
        console.log('');
        console.log('Bạn có thể đăng nhập app ngay bây giờ!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

createShipperAccount();
