const sequelize = require('./config/database');

const tables = [
    // Categories table
    `CREATE TABLE IF NOT EXISTS Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    parentId INT DEFAULT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (parentId) REFERENCES Categories(id) ON DELETE SET NULL
  ) ENGINE=InnoDB;`,

    // ProductImages table
    `CREATE TABLE IF NOT EXISTS ProductImages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    imageUrl TEXT NOT NULL,
    isPrimary TINYINT(1) DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // Reviews table
    `CREATE TABLE IF NOT EXISTS Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    userId INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // Wishlists table
    `CREATE TABLE IF NOT EXISTS Wishlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    productId INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (userId, productId)
  ) ENGINE=InnoDB;`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyerId INT NOT NULL,
    sellerId INT NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    shippingAddress TEXT,
    paymentMethod VARCHAR(50),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (buyerId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (sellerId) REFERENCES Users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // OrderItems table
    `CREATE TABLE IF NOT EXISTS OrderItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // Follows table
    `CREATE TABLE IF NOT EXISTS Follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    followerId INT NOT NULL,
    followingId INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (followerId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (followingId) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (followerId, followingId)
  ) ENGINE=InnoDB;`,

    // Likes table (for shops)
    `CREATE TABLE IF NOT EXISTS Likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    shopId INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (shopId) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (userId, shopId)
  ) ENGINE=InnoDB;`,

    // Messages table
    `CREATE TABLE IF NOT EXISTS Messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversationId INT NOT NULL,
    senderId INT NOT NULL,
    content TEXT NOT NULL,
    isRead TINYINT(1) DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (conversationId) REFERENCES Conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES Users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // ConversationParticipants table
    `CREATE TABLE IF NOT EXISTS ConversationParticipants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversationId INT NOT NULL,
    userId INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (conversationId) REFERENCES Conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (conversationId, userId)
  ) ENGINE=InnoDB;`
];

async function createAllTables() {
    try {
        console.log('Creating all missing tables...\n');

        for (let i = 0; i < tables.length; i++) {
            const tableName = tables[i].match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
            await sequelize.query(tables[i]);
            console.log(`✓ ${i + 1}/${tables.length} Created: ${tableName}`);
        }

        console.log('\n✅ All tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAllTables();
