-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 21, 2025 at 05:14 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tables`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizes`)),
  `image_urls` text DEFAULT NULL COMMENT 'Comma-separated list of image URLs for multiple product images',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `price`, `stock_quantity`, `description`, `color`, `sizes`, `image_urls`, `created_at`, `updated_at`) VALUES
(11, 1, 'Nike Zoom Fly 4', 149.99, 25, 'Lightweight running shoe with responsive cushioning', 'Blue/Orange', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', 'images-1753527666309-260665048.jpg', '2025-02-15 08:30:00', '2025-08-10 11:20:00'),
(13, 2, 'New Balance 57479', 89.99, 50, 'Iconic lifestyle sneaker with ENCAP midsole technology', 'Grey', '[7,8,10,11]', '/uploads/products/images-1754400602901-167003143.png,/uploads/products/images-1754400602943-126807941.png,/uploads/products/images-1754400602950-133613128.png', '2025-03-20 07:15:00', '2025-08-12 13:45:00'),
(14, 2, 'New Balance Fresh Foam 1080', 159.99, 20, 'Premium running shoe with Fresh Foam cushioning', 'Black/Green', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', 'images-1753527610093-494064700.jpg', '2025-04-05 11:30:00', '2025-08-15 08:30:00'),
(15, 2, 'New Balance 990v5', 184.99, 15, 'Made in USA with premium materials and ABZORB cushioning', 'Grey', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-04-18 13:20:00', '2025-08-14 10:15:00'),
(16, 2, 'New Balance 327', 79.99, 35, 'Retro-inspired design with suede and mesh upper', 'Beige/Orange', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-05-02 08:45:00', '2025-08-13 07:25:00'),
(17, 3, 'Adidas Ultraboost 22', 189.99, 30, 'Energy-returning Boost midsole with Primeknit upper', 'Black/White', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-05-15 10:30:00', '2025-08-11 12:40:00'),
(18, 3, 'Adidas Stan Smith', 84.99, 50, 'Classic tennis shoe with perforated 3-Stripes', 'White/Green', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-05-28 05:20:00', '2025-08-09 09:50:00'),
(19, 3, 'Adidas Yeezy Boost 350', 229.99, 10, 'Innovative design with Primeknit upper and Boost sole', 'Zebra', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-06-10 12:45:00', '2025-08-08 14:30:00'),
(20, 3, 'Adidas Gazelle', 74.99, 40, 'Retro soccer-inspired sneaker with suede upper', 'Blue/White', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-06-22 09:10:00', '2025-08-07 11:15:00'),
(21, 4, 'Puma RS-X', 109.99, 35, 'Retro running-inspired design with bold color blocking', 'White/Blue/Red', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-07-05 07:30:00', '2025-08-06 13:20:00'),
(22, 4, 'Puma Suede Classic', 64.99, 45, 'Timeless suede sneaker with Formstrip branding', 'Black/White', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-07-18 11:25:00', '2025-08-05 08:45:00'),
(23, 4, 'Puma Future Rider', 79.99, 30, 'Retro-inspired design with soft foam midsole', 'White/Green', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-07-25 06:40:00', '2025-08-04 10:30:00'),
(24, 4, 'Puma Cali Sport', 69.99, 40, 'Tennis-inspired design with leather upper', 'White/Pink', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-08-01 13:15:00', '2025-08-03 07:20:00'),
(25, 5, 'Vans Old Skool', 59.99, 55, 'Classic skate shoe with iconic side stripe', 'Black/White', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-08-05 08:30:00', '2025-08-02 12:35:00'),
(26, 5, 'Vans Authentic', 49.99, 60, 'Timeless slip-on design with canvas upper', 'White', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-08-08 10:45:00', '2025-08-01 09:40:00'),
(27, 5, 'Vans Sk8-Hi', 64.99, 40, 'High-top skate shoe with padded collar', 'Black/White', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-08-10 07:20:00', '2025-07-31 11:25:00'),
(28, 5, 'Vans ComfyCush Era', 54.99, 35, 'Enhanced comfort with ComfyCush technology', 'Navy/White', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-08-12 12:10:00', '2025-07-30 13:50:00'),
(29, 5, 'Vans Slip-On Pro', 69.99, 25, 'Professional skate shoe with Duracap reinforcement', 'Checkerboard', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-08-14 09:35:00', '2025-07-29 08:15:00'),
(30, 5, 'Vans Ultrarange', 79.99, 30, 'Lightweight performance shoe with UltraCush foam', 'Grey/Orange', '[\"7\", \"8\", \"9\", \"10\", \"11\", \"12\"]', NULL, '2025-08-16 06:50:00', '2025-07-28 10:45:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_created_at` (`created_at`),
  ADD KEY `idx_products_updated_at` (`updated_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
