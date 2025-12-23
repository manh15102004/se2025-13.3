const sequelize = require('./config/database');

const createProductsTable = `
CREATE TABLE IF NOT EXISTS Products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sellerId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category VARCHAR(255),
  subCategory VARCHAR(255),
  quantity INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INT DEFAULT 0,
  purchaseCount INT DEFAULT 0,
  isFeatured TINYINT(1) DEFAULT 0,
  status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (sellerId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

async function createTable() {
    try {
        await sequelize.query(createProductsTable);
        console.log('✅ Products table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        process.exit(1);
    }
}

createTable();
