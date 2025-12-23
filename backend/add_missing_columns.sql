-- Add missing columns to Users table
USE appsale;

-- Add facebookId column if it doesn't exist
ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS facebookId VARCHAR(100) NULL UNIQUE COMMENT 'Facebook user ID for OAuth login';

-- Add lastSeen column if it doesn't exist
ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS lastSeen DATETIME NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Last time user was active, used for online/offline status';

-- Verify the changes
DESCRIBE Users;
