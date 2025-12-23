const sequelize = require('./config/database');

// Create Notifications table
const createNotificationsTable = `
CREATE TABLE IF NOT EXISTS Notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  relatedId INT,
  isRead TINYINT(1) DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

// Reset product ratings to 0
const resetRatings = `
UPDATE Products 
SET rating = 0, reviews = 0 
WHERE id > 0;
`;

async function fixIssues() {
    try {
        console.log('Fixing issues...\n');

        // Create Notifications table
        await sequelize.query(createNotificationsTable);
        console.log('✓ Created Notifications table');

        // Reset ratings
        await sequelize.query(resetRatings);
        console.log('✓ Reset all product ratings to 0');

        console.log('\n✅ All issues fixed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixIssues();
