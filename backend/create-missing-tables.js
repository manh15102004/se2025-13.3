const sequelize = require('./config/database');

const missingTables = [
    // Cart table
    `CREATE TABLE IF NOT EXISTS Carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // CartItems table
    `CREATE TABLE IF NOT EXISTS CartItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cartId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    size VARCHAR(50),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (cartId) REFERENCES Carts(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // Addresses table
    `CREATE TABLE IF NOT EXISTS Addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    isDefault TINYINT(1) DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // Payments table
    `CREATE TABLE IF NOT EXISTS Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transactionId VARCHAR(255),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

    // Shipments table
    `CREATE TABLE IF NOT EXISTS Shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT NOT NULL,
    trackingNumber VARCHAR(255),
    carrier VARCHAR(100),
    status ENUM('pending', 'picked_up', 'in_transit', 'delivered', 'failed') DEFAULT 'pending',
    estimatedDelivery DATETIME,
    actualDelivery DATETIME,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`
];

async function createMissingTables() {
    try {
        console.log('Creating missing tables...\n');

        for (let i = 0; i < missingTables.length; i++) {
            const tableName = missingTables[i].match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
            await sequelize.query(missingTables[i]);
            console.log(`✓ ${i + 1}/${missingTables.length} Created: ${tableName}`);
        }

        console.log('\n✅ All missing tables created!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createMissingTables();
