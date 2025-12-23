const sequelize = require('./config/database');

const createUserConversationsTable = `
CREATE TABLE IF NOT EXISTS UserConversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NOT NULL,
  ConversationId INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (ConversationId) REFERENCES Conversations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_conversation (UserId, ConversationId)
) ENGINE=InnoDB;
`;

async function createTable() {
    try {
        await sequelize.query(createUserConversationsTable);
        console.log('✅ UserConversations table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTable();
