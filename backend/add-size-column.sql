-- Add size column to OrderItems table
ALTER TABLE `OrderItems` ADD COLUMN `size` VARCHAR(10) NULL AFTER `price`;

-- Add size column to Carts table  
ALTER TABLE `Carts` ADD COLUMN `size` VARCHAR(10) NULL AFTER `price`;

-- Verify columns were added
DESCRIBE `OrderItems`;
DESCRIBE `Carts`;
