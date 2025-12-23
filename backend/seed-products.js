const { Product, User, Category } = require('./models');

async function seedProducts() {
    try {
        console.log('Starting to seed products...\n');

        // Get all users to assign as sellers
        const users = await User.findAll();
        if (users.length === 0) {
            console.error('No users found! Please create users first.');
            process.exit(1);
        }

        // Sample product data
        const products = [
            // Electronics
            { name: 'iPhone 15 Pro Max', description: 'Điện thoại cao cấp, camera 48MP, chip A17 Pro', price: 29990000, category: 'Điện thoại', stock: 50, images: ['https://via.placeholder.com/400x400?text=iPhone+15'] },
            { name: 'Samsung Galaxy S24 Ultra', description: 'Màn hình Dynamic AMOLED 6.8 inch, S Pen tích hợp', price: 27990000, category: 'Điện thoại', stock: 45, images: ['https://via.placeholder.com/400x400?text=Galaxy+S24'] },
            { name: 'MacBook Pro M3', description: 'Laptop chuyên nghiệp, chip M3, 16GB RAM, 512GB SSD', price: 45990000, category: 'Laptop', stock: 30, images: ['https://via.placeholder.com/400x400?text=MacBook+Pro'] },
            { name: 'Dell XPS 15', description: 'Laptop cao cấp, Intel i7, 32GB RAM, màn hình 4K', price: 38990000, category: 'Laptop', stock: 25, images: ['https://via.placeholder.com/400x400?text=Dell+XPS'] },
            { name: 'iPad Pro 12.9"', description: 'Máy tính bảng chuyên nghiệp, chip M2, Apple Pencil', price: 25990000, category: 'Máy tính bảng', stock: 40, images: ['https://via.placeholder.com/400x400?text=iPad+Pro'] },

            // Fashion
            { name: 'Áo thun nam basic', description: 'Cotton 100%, form regular fit, nhiều màu', price: 199000, category: 'Thời trang nam', stock: 200, images: ['https://via.placeholder.com/400x400?text=Ao+Thun'] },
            { name: 'Quần jean nữ skinny', description: 'Chất liệu jean co giãn, ôm dáng, thời trang', price: 399000, category: 'Thời trang nữ', stock: 150, images: ['https://via.placeholder.com/400x400?text=Quan+Jean'] },
            { name: 'Váy maxi hoa', description: 'Váy dài thanh lịch, họa tiết hoa nhẹ nhàng', price: 599000, category: 'Thời trang nữ', stock: 100, images: ['https://via.placeholder.com/400x400?text=Vay+Maxi'] },
            { name: 'Giày thể thao Nike', description: 'Giày chạy bộ, đế êm, thoáng khí', price: 2990000, category: 'Giày dép', stock: 80, images: ['https://via.placeholder.com/400x400?text=Nike+Shoes'] },
            { name: 'Túi xách nữ da', description: 'Túi xách công sở, da PU cao cấp', price: 899000, category: 'Phụ kiện', stock: 60, images: ['https://via.placeholder.com/400x400?text=Tui+Xach'] },

            // Home & Living
            { name: 'Nồi cơm điện Panasonic', description: 'Dung tích 1.8L, công nghệ nấu IH', price: 3490000, category: 'Đồ gia dụng', stock: 50, images: ['https://via.placeholder.com/400x400?text=Noi+Com'] },
            { name: 'Máy lọc không khí Xiaomi', description: 'Lọc bụi mịn PM2.5, diện tích 40m²', price: 2990000, category: 'Đồ gia dụng', stock: 35, images: ['https://via.placeholder.com/400x400?text=May+Loc'] },
            { name: 'Bộ chăn ga gối Cotton', description: 'Cotton 100%, họa tiết hiện đại, size 1.8m', price: 799000, category: 'Đồ gia dụng', stock: 70, images: ['https://via.placeholder.com/400x400?text=Chan+Ga'] },
            { name: 'Đèn LED thông minh', description: 'Điều khiển qua app, 16 triệu màu', price: 499000, category: 'Đồ gia dụng', stock: 90, images: ['https://via.placeholder.com/400x400?text=Den+LED'] },

            // Beauty & Health
            { name: 'Kem chống nắng Anessa', description: 'SPF 50+, chống nước, dưỡng ẩm', price: 599000, category: 'Làm đẹp', stock: 120, images: ['https://via.placeholder.com/400x400?text=Kem+Chong+Nang'] },
            { name: 'Serum Vitamin C', description: 'Dưỡng trắng, mờ thâm, chống lão hóa', price: 899000, category: 'Làm đẹp', stock: 100, images: ['https://via.placeholder.com/400x400?text=Serum'] },
            { name: 'Máy massage cầm tay', description: 'Massage thư giãn, pin sạc, 5 chế độ', price: 1290000, category: 'Sức khỏe', stock: 45, images: ['https://via.placeholder.com/400x400?text=May+Massage'] },

            // Sports
            { name: 'Thảm tập Yoga', description: 'Chất liệu TPE, chống trượt, dày 6mm', price: 299000, category: 'Thể thao', stock: 80, images: ['https://via.placeholder.com/400x400?text=Tham+Yoga'] },
            { name: 'Bóng đá FIFA Quality', description: 'Bóng đá size 5, chất liệu PU cao cấp', price: 399000, category: 'Thể thao', stock: 60, images: ['https://via.placeholder.com/400x400?text=Bong+Da'] },
            { name: 'Găng tay boxing', description: 'Găng tay đấm bốc, da PU, size M/L', price: 699000, category: 'Thể thao', stock: 40, images: ['https://via.placeholder.com/400x400?text=Gang+Tay'] },
        ];

        // Create products
        let created = 0;
        for (const productData of products) {
            // Randomly assign to a user
            const randomUser = users[Math.floor(Math.random() * users.length)];

            await Product.create({
                ...productData,
                sellerId: randomUser.id,
                rating: (Math.random() * 2 + 3).toFixed(1), // Random rating 3.0-5.0
                reviewCount: Math.floor(Math.random() * 100) + 10, // Random 10-110 reviews
            });

            created++;
            console.log(`✓ Created: ${productData.name}`);
        }

        console.log(`\n✅ Successfully created ${created} products!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
