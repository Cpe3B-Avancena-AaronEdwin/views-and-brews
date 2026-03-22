-- 1. Siguraduhing tama ang Database name
CREATE DATABASE IF NOT EXISTS `views_and_brews`;
USE `views_and_brews`;

-- --------------------------------------------------------

-- 2. Table structure for table `admins` (Existing)
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- 3. Table structure for table `users` (Existing, updated collation)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- 4. Bagong Table: Categories (Para ma-organize ang Menu)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- 5. Table structure for table `products` (Updated for Admin Menu Control)
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` boolean DEFAULT TRUE, -- Dito mag-ba-base ang admin kung ipapakita sa customer
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- 6. Table structure for table `ingredients` (Updated for Costing with Units)
CREATE TABLE IF NOT EXISTS `ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `unit` ENUM('g', 'kg', 'ml', 'L') NOT NULL, -- Dito pipili ang admin ng unit
  `unit_cost` decimal(10,2) NOT NULL, -- Presyo base sa unit na napili (e.g. 500 per kg)
  `stock` decimal(10,2) NOT NULL DEFAULT 0, -- Decimal para sa precise inventory
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- 7. Bagong Table: Recipes (Ang logic ng Costing Analysis)
CREATE TABLE IF NOT EXISTS `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `quantity_needed` decimal(10,2) NOT NULL, -- Ilang unit ang kailangan per product
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- 8. Bagong Table: Orders (Para sa Customer Side ordering)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- 9. Bagong Table: Order Items (Para ma-track anong drinks ang binili)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL, -- Para kahit mag-change price, record stays same
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- Sample Data Injection (Optional)
INSERT INTO `categories` (`name`) VALUES ('Espresso Based'), ('Non-Coffee');

INSERT INTO `ingredients` (`name`, `unit`, `unit_cost`, `stock`) VALUES 
('Coffee Beans', 'kg', 650.00, 5.00), -- 5kg stock, 650 per kg
('Fresh Milk', 'L', 95.00, 10.00);   -- 10L stock, 95 per L

INSERT INTO `products` (`category_id`, `name`, `price`, `is_active`) VALUES 
(1, 'Espresso', 100.00, 1),
(1, 'Latte', 150.00, 1);

-- Isang Latte recipe: 18g beans at 200ml milk
-- Note: Dahil kg/L ang base unit, ang system math mo dapat nag-ko-convert
INSERT INTO `recipes` (`product_id`, `ingredient_id`, `quantity_needed`) VALUES 
(2, 1, 0.018), -- 18 grams in kg
(2, 2, 0.200); -- 200 ml in L

COMMIT;
