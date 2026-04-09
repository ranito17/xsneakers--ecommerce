-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 04, 2026 at 06:23 PM
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
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tracks important system activities for admin audit';

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `user_id`, `action_type`, `entity_type`, `entity_id`, `description`, `created_at`, `user_email`) VALUES
(115, NULL, 'USER_CREATED', 'user', NULL, 'New user account created', '2025-12-11 16:04:28', NULL),
(116, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-11 16:11:14', NULL),
(117, 18, 'STOCK_CHANGED', 'product', NULL, 'Product sizes updated #{id}', '2025-12-11 16:15:05', NULL),
(118, 18, 'STOCK_CHANGED', 'product', NULL, 'Product sizes updated #{id}', '2025-12-11 16:15:17', NULL),
(119, 18, 'STOCK_CHANGED', 'product', NULL, 'Product sizes updated #{id}', '2025-12-11 16:15:43', NULL),
(120, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-11 16:18:13', NULL),
(121, 108, 'STOCK_DECREASED', 'product', 2, 'Stock decreased: Dunk Low, Size 13, Quantity: 1 (Order #ORD-2025-001)', '2025-12-11 16:37:01', NULL),
(122, 108, 'ORDER_PLACED', 'order', NULL, 'New order placed #{id}', '2025-12-11 16:37:02', NULL),
(123, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category deactivated #{id}', '2025-12-11 18:53:07', NULL),
(124, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-11 18:53:40', NULL),
(125, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category activated #{id}', '2025-12-11 19:05:09', NULL),
(126, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-11 19:05:57', NULL),
(127, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-11 19:06:04', NULL),
(128, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-11 19:06:11', NULL),
(129, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-11 19:06:28', NULL),
(130, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category deactivated #{id}', '2025-12-11 19:06:42', NULL),
(131, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category activated #{id}', '2025-12-11 19:08:42', NULL),
(132, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category deactivated #{id}', '2025-12-11 19:08:58', NULL),
(133, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category activated #{id}', '2025-12-11 19:09:19', NULL),
(134, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category deactivated #{id}', '2025-12-11 19:09:24', NULL),
(135, 18, 'PRODUCT_CREATED', 'product', NULL, 'New product created', '2025-12-11 20:45:51', NULL),
(136, 18, 'STOCK_CHANGED', 'product', NULL, 'Product sizes updated #{id}', '2025-12-12 00:14:38', NULL),
(137, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category updated', '2025-12-12 00:24:11', NULL),
(138, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category activated #{id}', '2025-12-12 00:32:53', NULL),
(139, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category deactivated #{id}', '2025-12-12 00:40:34', NULL),
(140, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category activated #{id}', '2025-12-12 00:40:54', NULL),
(141, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category deactivated #{id}', '2025-12-12 00:46:09', NULL),
(142, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category activated #{id}', '2025-12-12 00:46:11', NULL),
(143, 18, 'ORDER_STATUS_CHANGED', 'order', NULL, 'Order #{id} status changed', '2025-12-12 00:48:48', NULL),
(144, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category updated', '2025-12-12 00:54:25', NULL),
(145, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category updated', '2025-12-12 00:54:36', NULL),
(146, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category updated', '2025-12-12 00:54:55', NULL),
(147, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category updated', '2025-12-12 00:55:04', NULL),
(148, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category activated #{id}', '2025-12-12 00:56:22', NULL),
(149, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-12 14:08:23', NULL),
(150, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-12 14:09:08', NULL),
(151, NULL, 'USER_CREATED', 'user', NULL, 'New user account created', '2025-12-12 14:37:31', NULL),
(152, 108, 'STOCK_DECREASED', 'product', 1, 'Stock decreased: Air Max 90, Size 6, Quantity: 1 (Order #ORD-2025-002)', '2025-12-12 14:49:09', NULL),
(153, 108, 'STOCK_DECREASED', 'product', 10, 'Stock decreased: 550 Heritage, Size 8, Quantity: 8 (Order #ORD-2025-002)', '2025-12-12 14:49:09', NULL),
(154, 108, 'ORDER_PLACED', 'order', NULL, 'New order placed #{id}', '2025-12-12 14:49:11', NULL),
(155, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category deactivated #{id}', '2025-12-12 15:12:45', NULL),
(156, 18, 'CATEGORY_UPDATED', 'category', NULL, 'Category activated #{id}', '2025-12-12 15:13:13', NULL),
(157, 103, 'STOCK_INCREASED', 'product', 2, 'Stock increased: Dunk Low, Size 9, Quantity: 1 (Order #ORD-2024-014 cancelled)', '2025-12-12 15:54:08', NULL),
(158, 103, 'STOCK_INCREASED', 'product', 12, 'Stock increased: Stan Smith, Size 8, Quantity: 1 (Order #ORD-2024-014 cancelled)', '2025-12-12 15:54:08', NULL),
(159, 103, 'ORDER_CANCELLED', 'order', 14, 'Order #ORD-2024-014 cancelled', '2025-12-12 15:54:08', NULL),
(160, 18, 'ORDER_STATUS_CHANGED', 'order', NULL, 'Order #{id} status changed', '2025-12-12 15:54:08', NULL),
(161, 18, 'ORDER_STATUS_CHANGED', 'order', NULL, 'Order #{id} status changed', '2025-12-12 16:20:24', NULL),
(162, 18, 'ORDER_STATUS_CHANGED', 'order', NULL, 'Order #{id} status changed', '2025-12-12 16:20:34', NULL),
(163, 18, 'ORDER_STATUS_CHANGED', 'order', NULL, 'Order #{id} status changed', '2025-12-12 16:21:04', NULL),
(164, 18, 'ORDER_STATUS_CHANGED', 'order', NULL, 'Order #{id} status changed', '2025-12-13 17:08:30', NULL),
(165, 18, 'ORDER_STATUS_CHANGED', 'order', NULL, 'Order #{id} status changed', '2025-12-13 17:08:52', NULL),
(166, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 17:16:03', NULL),
(167, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 17:17:11', NULL),
(168, 18, 'STOCK_CHANGED', 'product', NULL, 'Product sizes updated #{id}', '2025-12-13 17:18:02', NULL),
(169, 18, 'PRODUCT_CREATED', 'product', NULL, 'New product created', '2025-12-13 17:38:05', NULL),
(170, 18, 'PRODUCT_CREATED', 'product', NULL, 'New product created', '2025-12-13 17:41:55', NULL),
(171, 18, 'PRODUCT_CREATED', 'product', NULL, 'New product created', '2025-12-13 17:46:13', NULL),
(172, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-13 17:46:47', NULL),
(173, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-13 17:47:23', NULL),
(174, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-13 17:51:40', NULL),
(175, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 17:56:41', NULL),
(176, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 17:56:54', NULL),
(177, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 17:57:21', NULL),
(178, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 17:57:54', NULL),
(179, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 17:58:06', NULL),
(180, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 18:10:40', NULL),
(181, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 18:15:27', NULL),
(182, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 18:19:58', NULL),
(183, 18, 'SETTINGS_UPDATED', 'settings', NULL, 'System settings updated', '2025-12-13 18:24:09', NULL),
(184, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-14 07:13:23', NULL),
(185, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-14 07:32:40', NULL),
(186, 18, 'PRODUCT_UPDATED', 'product', NULL, 'Product updated', '2025-12-14 07:35:31', NULL),
(187, 108, 'STOCK_DECREASED', 'product', 2, 'Stock decreased: Dunk Low, Size 8, Quantity: 1 (Order #ORD-2025-026)', '2025-12-14 07:37:39', NULL),
(188, 108, 'STOCK_DECREASED', 'product', 11, 'Stock decreased: Ultraboost 22, Size 11, Quantity: 2 (Order #ORD-2025-026)', '2025-12-14 07:37:39', NULL),
(189, 108, 'ORDER_PLACED', 'order', NULL, 'New order placed #{id}', '2025-12-14 07:37:40', NULL),
(190, 108, 'STOCK_DECREASED', 'product', 19, 'Stock decreased: Suede Classic, Size 8, Quantity: 3 (Order #ORD-2025-027)', '2025-12-14 09:29:25', NULL),
(191, 108, 'ORDER_PLACED', 'order', NULL, 'New order placed #{id}', '2025-12-14 09:29:26', NULL),
(192, 18, 'PRODUCT_CREATED', 'product', NULL, 'New product created', '2025-12-14 09:32:07', NULL),
(193, 18, 'CATEGORY_CREATED', 'category', NULL, 'New category created', '2025-12-14 09:32:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `cart_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`cart_id`, `user_id`, `total_cost`, `created_at`) VALUES
(1, 100, 259.98, '2024-12-01 08:00:00'),
(2, 101, 189.99, '2024-12-01 08:00:00'),
(3, 102, 319.97, '2024-12-01 08:00:00'),
(4, 103, 224.97, '2024-12-01 08:00:00'),
(5, 104, 0.00, '2024-12-01 08:00:00'),
(6, 105, 149.98, '2024-12-01 08:00:00'),
(7, 106, 0.00, '2024-12-01 08:00:00'),
(8, 107, 179.98, '2024-12-01 08:00:00'),
(9, 108, 0.00, '2025-12-11 16:05:01'),
(10, 18, 0.00, '2025-12-11 16:10:57'),
(11, 109, 0.00, '2025-12-12 14:37:45');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `selected_size` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`cart_item_id`, `cart_id`, `product_id`, `quantity`, `price`, `selected_size`) VALUES
(1, 1, 5, 1, 109.99, '9'),
(2, 1, 15, 1, 89.99, '10'),
(3, 1, 25, 1, 54.99, '8'),
(4, 2, 11, 1, 189.99, '9'),
(5, 3, 1, 1, 129.99, '10'),
(6, 3, 11, 1, 189.99, '11'),
(7, 4, 10, 1, 94.99, '9'),
(8, 4, 20, 1, 99.99, '10'),
(9, 4, 25, 1, 54.99, '8'),
(10, 6, 8, 1, 89.99, '10'),
(11, 6, 18, 1, 69.99, '9'),
(12, 8, 10, 1, 94.99, '11'),
(13, 8, 20, 1, 99.99, '10');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`image_urls`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `description`, `image_urls`, `is_active`) VALUES
(1, 'Nike', 'Premium athletic footwear and sportswear from the world\'s leading sports brand. Known for innovation, performance, and iconic designs that have shaped sports culture for decades.', '[\"/uploads/category/category-1765500865399-434323778.png\"]', 1),
(2, 'New Balance', 'Comfort-focused footwear combining classic style with modern comfort .', '[\"/uploads/category/category-1765499051796-680991818.png\"]', 1),
(3, 'Adidas', 'German sportswear giant offering cutting-edge athletic footwear and lifestyle sneakers. Combining performance technology with street style for athletes and fashion enthusiasts.', '[\"/uploads/category/category-1765500876566-851171885.png\"]', 1),
(4, 'Puma', 'Dynamic sportswear brand delivering high-performance athletic shoes with bold designs. From professional sports to street fashion, Puma brings energy and innovation to every step.', '[\"/uploads/category/category-1765500894887-563785213.png\"]', 1),
(5, 'Vans', 'Iconic skateboarding and lifestyle brand known for classic silhouettes and timeless designs. From the skate park to the streets, Vans represents authentic youth culture and creative expression.', '[\"/uploads/category/category-1765500904738-778331942.jpeg\"]', 1),
(21, 'accord', 'ggggggggggggggggg', '[\"/uploads/category/category-1765704774584-184290255.png\"]', 1);

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `message_id` int(11) NOT NULL,
  `message_type` enum('guest_to_admin','customer_to_admin','customer_to_admin_urgent','admin_to_admin','admin_to_supplier','low_stock_alert') NOT NULL,
  `sender_user_id` int(11) DEFAULT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `sender_phone` varchar(20) DEFAULT NULL,
  `recipient_email` varchar(255) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `status` enum('new','read','resolved','archived') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`message_id`, `message_type`, `sender_user_id`, `sender_name`, `sender_email`, `sender_phone`, `recipient_email`, `subject`, `message`, `order_id`, `product_id`, `status`, `created_at`, `updated_at`) VALUES
(22, 'customer_to_admin', NULL, 'sasasas', 'rtobassy@gmail.com', NULL, NULL, 'sasasassasa', 'sassssssssss', NULL, NULL, 'read', '2025-12-11 17:04:13', '2025-12-14 09:41:41'),
(23, 'customer_to_admin_urgent', NULL, 'rani tobassy', 'rtobassy@gmail.com', NULL, NULL, 'URGENT: Issue with Order ORD-2025-001', 'aaaaaaaaaaaaaaaaaaaaaaaaa', 23, NULL, 'resolved', '2025-12-11 17:20:18', '2025-12-13 15:32:19'),
(24, 'customer_to_admin', 100, 'David Cohen', 'davidcohen123@gmail.com', '0512345678', NULL, 'Question about Order ORD-2025-002', 'Hi, I placed an order last week and wanted to check on the delivery status. Can you provide an update?', 24, NULL, 'read', '2025-12-06 12:30:00', '2025-12-07 08:00:00'),
(25, 'customer_to_admin', 101, 'Sarah Levy', 'sarahlevy456@gmail.com', '0523456789', NULL, 'Size Exchange Request', 'I received my order but the size is too small. Can I exchange it for a larger size?', 25, 11, 'new', '2025-12-07 14:20:00', '2025-12-07 14:20:00'),
(26, 'customer_to_admin_urgent', 102, 'Michael Ben David', 'michaelbd789@gmail.com', '0534567890', NULL, 'URGENT: Wrong Product Received', 'I ordered Air Max 90 but received a different product. This is urgent as I need it for a gift. Please help!', 26, 1, 'new', '2025-12-08 09:45:00', '2025-12-08 09:45:00'),
(27, 'customer_to_admin', 103, 'Rachel Mizrahi', 'rachelmiz012@gmail.com', '0545678901', NULL, 'Delivery Address Change', 'I need to change the delivery address for my recent order. Is it still possible?', 27, NULL, 'read', '2025-12-09 07:15:00', '2025-12-09 12:30:00'),
(28, 'customer_to_admin', 104, 'Jonathan Ashkenazi', 'jonathanash345@gmail.com', '0556789012', NULL, 'Product Quality Question', 'I received my sneakers and noticed a small defect. Can you help me with a replacement?', 28, 2, 'new', '2025-12-10 16:00:00', '2025-12-10 16:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `arrival_date_estimated` date DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `order_number` varchar(20) DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Delivery address stored as JSON: {house_number, street, city, zipcode}' CHECK (json_valid(`address`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `created_at`, `arrival_date_estimated`, `payment_status`, `total_amount`, `order_number`, `status`, `updated_at`, `address`) VALUES
(1, 100, '2024-11-10 12:30:00', '2024-12-10', 'paid', 284.97, 'ORD-2024-001', 'delivered', '2024-11-15 08:00:00', '{\"house_number\":\"25\",\"street\":\"Herzl Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"61000\"}'),
(2, 100, '2024-11-25 14:45:00', '2024-12-25', 'paid', 189.99, 'ORD-2024-002', 'shipped', '2024-11-26 07:00:00', '{\"house_number\":\"25\",\"street\":\"Herzl Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"61000\"}'),
(3, 101, '2024-10-15 07:20:00', '2024-11-15', 'paid', 164.98, 'ORD-2024-003', 'delivered', '2024-10-20 11:00:00', '{\"house_number\":\"42\",\"street\":\"Dizengoff Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"64332\"}'),
(4, 101, '2024-11-05 09:30:00', '2024-12-05', 'paid', 339.97, 'ORD-2024-004', 'processing', '2024-11-06 06:00:00', '{\"house_number\":\"42\",\"street\":\"Dizengoff Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"64332\"}'),
(5, 101, '2024-11-20 11:15:00', '2024-12-20', 'paid', 219.98, 'ORD-2024-005', 'shipped', '2025-12-12 16:20:34', '{\"house_number\":\"42\",\"street\":\"Dizengoff Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"64332\"}'),
(6, 102, '2024-09-12 06:45:00', '2024-10-12', 'paid', 194.98, 'ORD-2024-006', 'delivered', '2024-09-18 08:00:00', '{\"house_number\":\"18\",\"street\":\"Rothschild Boulevard\",\"city\":\"Tel Aviv\",\"zipcode\":\"66881\"}'),
(7, 102, '2024-10-08 12:20:00', '2024-11-08', 'paid', 254.97, 'ORD-2024-007', 'delivered', '2024-10-12 07:00:00', '{\"house_number\":\"18\",\"street\":\"Rothschild Boulevard\",\"city\":\"Tel Aviv\",\"zipcode\":\"66881\"}'),
(8, 102, '2024-11-01 10:00:00', '2024-12-01', 'paid', 404.96, 'ORD-2024-008', 'shipped', '2024-11-02 07:00:00', '{\"house_number\":\"18\",\"street\":\"Rothschild Boulevard\",\"city\":\"Tel Aviv\",\"zipcode\":\"66881\"}'),
(9, 102, '2024-11-18 12:30:00', '2024-12-18', 'paid', 149.98, 'ORD-2024-009', 'pending', '2024-11-18 12:30:00', '{\"house_number\":\"18\",\"street\":\"Rothschild Boulevard\",\"city\":\"Tel Aviv\",\"zipcode\":\"66881\"}'),
(10, 103, '2024-08-20 07:15:00', '2024-09-20', 'paid', 179.98, 'ORD-2024-010', 'delivered', '2024-08-25 09:00:00', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(11, 103, '2024-09-15 08:30:00', '2024-10-15', 'paid', 239.97, 'ORD-2024-011', 'delivered', '2024-09-20 07:00:00', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(12, 103, '2024-10-10 10:45:00', '2024-11-10', 'paid', 314.96, 'ORD-2024-012', 'shipped', '2024-10-11 05:00:00', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(13, 103, '2024-11-05 13:00:00', '2024-12-05', 'paid', 429.95, 'ORD-2024-013', 'processing', '2024-11-06 07:00:00', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(14, 103, '2024-11-22 14:20:00', '2024-12-22', 'paid', 199.98, 'ORD-2024-014', 'cancelled', '2025-12-12 15:54:08', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(15, 104, '2024-10-25 08:00:00', '2024-11-25', 'paid', 184.99, 'ORD-2024-015', 'delivered', '2024-10-28 12:00:00', '{\"house_number\":\"56\",\"street\":\"Ben Yehuda Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(16, 105, '2024-11-12 07:30:00', '2024-12-12', 'paid', 149.98, 'ORD-2024-016', 'shipped', '2024-11-13 08:00:00', '{\"house_number\":\"12\",\"street\":\"Allenby Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(17, 38, '2024-09-28 07:00:00', '2024-10-28', 'paid', 274.98, 'ORD-2024-017', 'delivered', '2024-10-02 09:00:00', '{\"house_number\":\"17\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"202000\"}'),
(18, 38, '2024-10-15 11:30:00', '2024-11-15', 'paid', 354.97, 'ORD-2024-018', 'delivered', '2024-10-18 08:00:00', '{\"house_number\":\"17\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"202000\"}'),
(19, 38, '2024-10-30 14:00:00', '2024-11-30', 'paid', 464.96, 'ORD-2024-019', 'shipped', '2024-11-01 07:00:00', '{\"house_number\":\"17\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"202000\"}'),
(20, 38, '2024-11-10 09:20:00', '2024-12-10', 'paid', 199.98, 'ORD-2024-020', 'processing', '2024-11-11 06:00:00', '{\"house_number\":\"17\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"202000\"}'),
(21, 38, '2024-11-18 11:45:00', '2024-12-18', 'paid', 519.95, 'ORD-2024-021', 'pending', '2024-11-18 11:45:00', '{\"house_number\":\"17\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"202000\"}'),
(22, 38, '2024-11-28 13:10:00', '2024-12-28', 'paid', 224.97, 'ORD-2024-022', 'pending', '2024-11-28 13:10:00', '{\"house_number\":\"17\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"202000\"}'),
(23, 108, '2025-12-11 16:37:01', '2026-01-11', 'paid', 109.99, 'ORD-2025-001', 'shipped', '2025-12-12 16:21:04', '{\"house_number\":\"17\",\"street\":\"fgdfgf\",\"city\":\"haifa\",\"zipcode\":\"202000\"}'),
(24, 108, '2025-12-12 14:49:09', '2026-01-12', 'paid', 889.91, 'ORD-2025-002', 'delivered', '2025-12-12 16:20:24', '{\"house_number\":\"17\",\"street\":\"fgdfgf\",\"city\":\"haifa\",\"zipcode\":\"202000\"}'),
(25, 101, '2025-12-06 12:30:00', '2026-01-06', 'paid', 189.99, 'ORD-2025-003', 'shipped', '2025-12-07 06:00:00', '{\"house_number\":\"42\",\"street\":\"Dizengoff Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"64332\"}'),
(26, 102, '2025-12-07 07:45:00', '2026-01-07', 'paid', 404.96, 'ORD-2025-004', 'processing', '2025-12-08 05:00:00', '{\"house_number\":\"18\",\"street\":\"Rothschild Boulevard\",\"city\":\"Tel Aviv\",\"zipcode\":\"66881\"}'),
(27, 103, '2025-12-08 09:20:00', '2026-01-08', 'paid', 274.98, 'ORD-2025-005', 'delivered', '2025-12-10 08:00:00', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(28, 104, '2025-12-09 14:10:00', '2026-01-09', 'paid', 149.98, 'ORD-2025-006', 'shipped', '2025-12-10 06:00:00', '{\"house_number\":\"56\",\"street\":\"Ben Yehuda Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(29, 105, '2025-12-10 11:25:00', '2026-01-10', 'paid', 519.95, 'ORD-2025-007', 'processing', '2025-12-11 05:00:00', '{\"house_number\":\"12\",\"street\":\"Allenby Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(30, 106, '2025-12-11 13:40:00', '2026-01-11', 'paid', 224.97, 'ORD-2025-008', 'pending', '2025-12-11 13:40:00', '{\"house_number\":\"78\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(31, 107, '2025-12-12 08:00:00', '2026-01-12', 'paid', 339.97, 'ORD-2025-009', 'delivered', '2025-12-13 17:08:52', '{\"house_number\":\"91\",\"street\":\"Weizmann Street\",\"city\":\"Beer Sheva\",\"zipcode\":\"84100\"}'),
(32, 100, '2025-11-15 06:30:00', '2025-12-15', 'paid', 429.95, 'ORD-2025-010', 'delivered', '2025-11-18 07:00:00', '{\"house_number\":\"25\",\"street\":\"Herzl Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"61000\"}'),
(33, 101, '2025-11-20 10:15:00', '2025-12-20', 'paid', 199.98, 'ORD-2025-011', 'shipped', '2025-11-21 06:00:00', '{\"house_number\":\"42\",\"street\":\"Dizengoff Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"64332\"}'),
(34, 102, '2025-11-25 12:50:00', '2025-12-25', 'paid', 354.97, 'ORD-2025-012', 'delivered', '2025-11-28 08:00:00', '{\"house_number\":\"18\",\"street\":\"Rothschild Boulevard\",\"city\":\"Tel Aviv\",\"zipcode\":\"66881\"}'),
(35, 103, '2025-12-01 07:20:00', '2026-01-01', 'paid', 464.96, 'ORD-2025-013', 'processing', '2025-12-02 05:00:00', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(36, 104, '2025-12-02 09:35:00', '2026-01-02', 'paid', 184.99, 'ORD-2025-014', 'shipped', '2025-12-03 06:00:00', '{\"house_number\":\"56\",\"street\":\"Ben Yehuda Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(37, 105, '2025-12-03 14:45:00', '2026-01-03', 'paid', 314.96, 'ORD-2025-015', 'delivered', '2025-12-05 07:00:00', '{\"house_number\":\"12\",\"street\":\"Allenby Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(38, 106, '2025-12-04 08:20:00', '2026-01-04', 'paid', 254.97, 'ORD-2025-016', 'processing', '2025-12-05 05:00:00', '{\"house_number\":\"78\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(39, 107, '2025-10-10 10:00:00', '2025-11-10', 'paid', 179.98, 'ORD-2025-017', 'delivered', '2025-10-15 05:00:00', '{\"house_number\":\"91\",\"street\":\"Weizmann Street\",\"city\":\"Beer Sheva\",\"zipcode\":\"84100\"}'),
(40, 100, '2025-10-18 12:30:00', '2025-11-18', 'paid', 404.96, 'ORD-2025-018', 'shipped', '2025-10-20 06:00:00', '{\"house_number\":\"25\",\"street\":\"Herzl Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"61000\"}'),
(41, 101, '2025-10-25 06:15:00', '2025-11-25', 'paid', 274.98, 'ORD-2025-019', 'delivered', '2025-10-28 08:00:00', '{\"house_number\":\"42\",\"street\":\"Dizengoff Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"64332\"}'),
(42, 102, '2025-11-05 09:40:00', '2025-12-05', 'paid', 519.95, 'ORD-2025-020', 'processing', '2025-11-06 06:00:00', '{\"house_number\":\"18\",\"street\":\"Rothschild Boulevard\",\"city\":\"Tel Aviv\",\"zipcode\":\"66881\"}'),
(43, 103, '2025-11-12 12:25:00', '2025-12-12', 'paid', 224.97, 'ORD-2025-021', 'shipped', '2025-11-13 05:00:00', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(44, 104, '2025-11-18 08:50:00', '2025-12-18', 'paid', 339.97, 'ORD-2025-022', 'delivered', '2025-11-20 07:00:00', '{\"house_number\":\"56\",\"street\":\"Ben Yehuda Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(45, 105, '2025-11-22 14:15:00', '2025-12-22', 'paid', 189.99, 'ORD-2025-023', 'processing', '2025-11-23 06:00:00', '{\"house_number\":\"12\",\"street\":\"Allenby Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(46, 106, '2025-11-28 10:30:00', '2025-12-28', 'paid', 464.96, 'ORD-2025-024', 'pending', '2025-11-28 10:30:00', '{\"house_number\":\"78\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(47, 107, '2025-12-01 06:45:00', '2026-01-01', 'paid', 199.98, 'ORD-2025-025', 'shipped', '2025-12-02 05:00:00', '{\"house_number\":\"91\",\"street\":\"Weizmann Street\",\"city\":\"Beer Sheva\",\"zipcode\":\"84100\"}'),
(48, 108, '2025-12-14 07:37:39', '2026-01-14', 'paid', 479.97, 'ORD-2025-026', 'pending', '2025-12-14 07:37:39', '{\"house_number\":\"17\",\"street\":\"fgdfgf\",\"city\":\"haifa\",\"zipcode\":\"202000\"}'),
(49, 108, '2025-12-14 09:29:25', '2026-01-14', 'paid', 224.97, 'ORD-2025-027', 'pending', '2025-12-14 09:29:25', '{\"house_number\":\"17\",\"street\":\"fgdfgf\",\"city\":\"haifa\",\"zipcode\":\"202000\"}');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `selected_size` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `selected_size`) VALUES
(1, 1, 1, '9'),
(1, 11, 1, '10'),
(2, 11, 1, '8'),
(3, 2, 1, '8'),
(3, 12, 1, '9'),
(4, 6, 2, '10'),
(4, 16, 1, '9'),
(5, 3, 1, '11'),
(5, 13, 1, '10'),
(6, 3, 1, '9'),
(6, 13, 1, '8'),
(7, 7, 1, '10'),
(7, 17, 1, '9'),
(8, 1, 2, '11'),
(8, 11, 1, '12'),
(9, 2, 1, '10'),
(10, 6, 1, '9'),
(10, 16, 1, '10'),
(11, 8, 1, '11'),
(11, 18, 1, '9'),
(11, 23, 1, '10'),
(12, 10, 2, '8'),
(12, 20, 1, '9'),
(13, 1, 1, '12'),
(13, 11, 1, '11'),
(13, 21, 1, '10'),
(14, 2, 1, '9'),
(14, 12, 1, '8'),
(15, 7, 1, '9'),
(16, 8, 1, '10'),
(16, 18, 1, '9'),
(17, 11, 1, '9'),
(17, 12, 1, '10'),
(18, 1, 1, '11'),
(18, 11, 1, '8'),
(18, 21, 1, '9'),
(19, 2, 2, '10'),
(19, 12, 1, '11'),
(19, 22, 1, '9'),
(20, 3, 1, '10'),
(20, 13, 1, '9'),
(21, 1, 1, '12'),
(21, 11, 2, '10'),
(21, 21, 1, '11'),
(22, 6, 1, '9'),
(22, 16, 1, '10'),
(22, 23, 1, '8'),
(23, 2, 1, '13'),
(24, 1, 1, '6'),
(24, 10, 8, '8'),
(24, 1, 2, '10'),
(24, 11, 1, '9'),
(25, 11, 1, '10'),
(26, 1, 2, '11'),
(26, 11, 1, '12'),
(26, 21, 1, '9'),
(27, 11, 1, '8'),
(27, 12, 1, '10'),
(28, 2, 1, '9'),
(29, 1, 1, '12'),
(29, 11, 2, '10'),
(29, 21, 1, '11'),
(30, 6, 1, '9'),
(30, 16, 1, '10'),
(30, 23, 1, '8'),
(31, 6, 2, '10'),
(31, 16, 1, '9'),
(32, 1, 1, '11'),
(32, 11, 1, '10'),
(32, 21, 1, '9'),
(33, 2, 1, '10'),
(34, 1, 2, '12'),
(34, 11, 1, '11'),
(34, 21, 1, '10'),
(35, 2, 2, '10'),
(35, 12, 1, '11'),
(36, 6, 1, '9'),
(36, 16, 1, '10'),
(37, 11, 1, '9'),
(37, 12, 1, '10'),
(38, 1, 1, '11'),
(38, 11, 1, '8'),
(39, 6, 1, '9'),
(40, 1, 2, '11'),
(40, 11, 1, '12'),
(41, 11, 1, '9'),
(41, 12, 1, '10'),
(42, 1, 1, '12'),
(42, 11, 2, '10'),
(42, 21, 1, '11'),
(43, 2, 1, '9'),
(43, 12, 1, '8'),
(44, 6, 2, '10'),
(44, 16, 1, '9'),
(45, 11, 1, '10'),
(46, 2, 2, '10'),
(46, 12, 1, '11'),
(47, 6, 1, '9'),
(47, 16, 1, '10'),
(48, 2, 1, '8'),
(48, 11, 2, '11'),
(49, 19, 3, '8');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `homepage_display` enum('none','bestsellers','latest','both') DEFAULT 'none' COMMENT 'Controls where product appears on homepage sections',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Product status: 1 = active, 0 = inactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `price`, `stock_quantity`, `description`, `color`, `sizes`, `image_urls`, `created_at`, `updated_at`, `homepage_display`, `is_active`) VALUES
(1, 1, 'Air Max 90', 129.99, 51, 'Classic running shoe with visible Air cushioning', 'Black/White', '[{\"size\":6,\"quantity\":4},{\"size\":7,\"quantity\":8},{\"size\":8,\"quantity\":8},{\"size\":9,\"quantity\":8},{\"size\":10,\"quantity\":8},{\"size\":11,\"quantity\":7},{\"size\":12,\"quantity\":8}]', NULL, '2024-12-01 10:00:00', '2025-12-13 17:51:39', 'bestsellers', 0),
(2, 1, 'Dunk Low', 99.99, 55, 'Retro basketball-inspired lifestyle sneaker', 'White/Black', '[{\"size\":7,\"quantity\":9},{\"size\":8,\"quantity\":8},{\"size\":9,\"quantity\":10},{\"size\":10,\"quantity\":9},{\"size\":11,\"quantity\":8},{\"size\":12,\"quantity\":8},{\"size\":13,\"quantity\":3}]', '/uploads/products/images-1765470108655-742936829.png', '2024-12-01 10:00:00', '2025-12-14 07:37:39', 'bestsellers', 1),
(3, 1, 'React Element 55', 119.99, 38, 'Modern running shoe with React foam technology', 'Grey/Blue', '[{\"size\":7,\"quantity\":7},{\"size\":8,\"quantity\":7},{\"size\":9,\"quantity\":7},{\"size\":10,\"quantity\":6},{\"size\":11,\"quantity\":6},{\"size\":12,\"quantity\":5}]', '/uploads/products/images-1765470096907-563256868.png', '2024-12-01 10:00:00', '2025-12-11 16:21:37', 'none', 1),
(4, 1, 'Blazer Mid 77', 89.99, 0, 'Vintage basketball shoe with retro styling', 'White/Red', '[]', '/uploads/products/images-1765470013003-484910398.png', '2024-12-01 10:00:00', '2025-12-11 16:20:13', 'none', 1),
(5, 1, 'Pegasus 40', 109.99, 42, 'Versatile running shoe for daily training', 'Blue/White', '[{\"size\":8,\"quantity\":7},{\"size\":9,\"quantity\":7},{\"size\":10,\"quantity\":7},{\"size\":11,\"quantity\":7},{\"size\":12,\"quantity\":7},{\"size\":13,\"quantity\":7}]', '/uploads/products/images-1765469941243-84759944.png', '2024-12-01 10:00:00', '2025-12-11 16:19:01', 'none', 1),
(6, 2, '574 Classic', 79.99, 52, 'Iconic lifestyle sneaker with ENCAP midsole', 'Grey', '[{\"size\":6,\"quantity\":8},{\"size\":7,\"quantity\":8},{\"size\":8,\"quantity\":8},{\"size\":9,\"quantity\":8},{\"size\":10,\"quantity\":8},{\"size\":11,\"quantity\":8},{\"size\":12,\"quantity\":4}]', '/uploads/products/images-1765500845510-998674245.png', '2024-12-01 10:00:00', '2025-12-12 15:13:13', 'bestsellers', 1),
(7, 2, '990v5 Made in USA', 184.99, 15, 'Premium running shoe with ABZORB cushioning', 'Grey/Blue', '[{\"size\":7,\"quantity\":3},{\"size\":8,\"quantity\":3},{\"size\":9,\"quantity\":3},{\"size\":10,\"quantity\":2},{\"size\":11,\"quantity\":2},{\"size\":12,\"quantity\":2}]', '/uploads/products/images-1765480322599-798060322.png', '2024-12-01 10:00:00', '2025-12-12 15:13:13', 'none', 1),
(8, 2, '327 Retro', 89.99, 36, 'Retro-inspired design with suede and mesh', 'Beige/Orange', '[{\"size\":7,\"quantity\":6},{\"size\":8,\"quantity\":6},{\"size\":9,\"quantity\":6},{\"size\":10,\"quantity\":6},{\"size\":11,\"quantity\":6},{\"size\":12,\"quantity\":6}]', '/uploads/products/images-1765697724646-134703920.png', '2024-12-01 10:00:00', '2025-12-14 07:35:31', 'none', 0),
(9, 2, 'Fresh Foam X 1080', 159.99, 14, 'Premium running shoe with Fresh Foam cushioning', 'Black/Green', '[{\"size\":\"9\",\"quantity\":9},{\"size\":\"8\",\"quantity\":5}]', '/uploads/products/images-1765480278601-146101609.png', '2024-12-01 10:00:00', '2025-12-13 17:18:02', 'none', 1),
(10, 2, '550 Heritage', 94.99, 40, 'Basketball-inspired lifestyle sneaker', 'White/Grey', '[{\"size\":8,\"quantity\":0},{\"size\":9,\"quantity\":8},{\"size\":10,\"quantity\":8},{\"size\":11,\"quantity\":8},{\"size\":12,\"quantity\":8},{\"size\":13,\"quantity\":8}]', NULL, '2024-12-01 10:00:00', '2025-12-14 07:13:23', 'none', 0),
(11, 3, 'Ultraboost 22', 189.99, 26, 'Energy-returning Boost midsole with Primeknit upper', 'Black/White', '[{\"size\":7,\"quantity\":5},{\"size\":8,\"quantity\":5},{\"size\":9,\"quantity\":5},{\"size\":10,\"quantity\":4},{\"size\":11,\"quantity\":3},{\"size\":12,\"quantity\":4}]', '/uploads/products/images-1765470245127-929199777.png', '2024-12-01 10:00:00', '2025-12-14 07:37:39', 'bestsellers', 1),
(12, 3, 'Stan Smith', 84.99, 53, 'Classic tennis shoe with perforated 3-Stripes', 'White/Green', '[{\"size\":6,\"quantity\":8},{\"size\":7,\"quantity\":8},{\"size\":8,\"quantity\":9},{\"size\":9,\"quantity\":8},{\"size\":10,\"quantity\":8},{\"size\":11,\"quantity\":8},{\"size\":12,\"quantity\":4}]', '/uploads/products/images-1765470230612-234766058.png', '2024-12-01 10:00:00', '2025-12-12 15:54:08', 'bestsellers', 1),
(13, 3, 'Gazelle', 74.99, 40, 'Retro soccer-inspired sneaker with suede upper', 'Blue/White', '[{\"size\":7,\"quantity\":7},{\"size\":8,\"quantity\":7},{\"size\":9,\"quantity\":7},{\"size\":10,\"quantity\":7},{\"size\":11,\"quantity\":6},{\"size\":12,\"quantity\":6}]', '/uploads/products/images-1765470214074-496501569.png', '2024-12-01 10:00:00', '2025-12-11 16:23:34', 'none', 1),
(14, 3, 'Samba OG', 79.99, 0, 'Classic indoor soccer shoe with gum sole', 'White/Black', '[]', '/uploads/products/images-1765470162353-173955534.png', '2024-12-01 10:00:00', '2025-12-11 16:22:42', 'none', 1),
(15, 3, 'Forum Low', 89.99, 42, 'Basketball-inspired lifestyle sneaker', 'White/Blue', '[{\"size\":8,\"quantity\":7},{\"size\":9,\"quantity\":7},{\"size\":10,\"quantity\":7},{\"size\":11,\"quantity\":7},{\"size\":12,\"quantity\":7},{\"size\":13,\"quantity\":7}]', '/uploads/products/images-1765470149048-354994113.png', '2024-12-01 10:00:00', '2025-12-11 16:22:29', 'none', 1),
(16, 4, 'RS-X3', 109.99, 35, 'Retro running-inspired design with bold colors', 'White/Blue/Red', '[{\"size\":7,\"quantity\":6},{\"size\":8,\"quantity\":6},{\"size\":9,\"quantity\":6},{\"size\":10,\"quantity\":6},{\"size\":11,\"quantity\":6},{\"size\":12,\"quantity\":5}]', '/uploads/products/images-1765500240195-584993896.png', '2024-12-01 10:00:00', '2025-12-12 00:44:00', 'bestsellers', 1),
(17, 4, 'Future Rider', 79.99, 30, 'Retro-inspired design with soft foam midsole', 'White/Green', '[{\"size\":6,\"quantity\":5},{\"size\":7,\"quantity\":5},{\"size\":8,\"quantity\":5},{\"size\":9,\"quantity\":5},{\"size\":10,\"quantity\":5},{\"size\":11,\"quantity\":5}]', '/uploads/products/images-1765500090102-938823725.png', '2024-12-01 10:00:00', '2025-12-12 00:41:30', 'none', 1),
(18, 4, 'Cali Sport', 69.99, 40, 'Tennis-inspired design with leather upper', 'White/Pink', '[{\"size\":7,\"quantity\":7},{\"size\":8,\"quantity\":7},{\"size\":9,\"quantity\":7},{\"size\":10,\"quantity\":7},{\"size\":11,\"quantity\":6},{\"size\":12,\"quantity\":6}]', '/uploads/products/images-1765499798320-409210828.png', '2024-12-01 10:00:00', '2025-12-12 00:36:38', 'none', 1),
(19, 4, 'Suede Classic', 74.99, 4, 'Iconic suede sneaker with timeless design', 'Black/White', '[{\"size\":\"8\",\"quantity\":0},{\"size\":\"9\",\"quantity\":4}]', '/uploads/products/images-1765500487888-781409640.png', '2024-12-01 10:00:00', '2025-12-14 09:29:25', 'none', 1),
(20, 4, 'Thunder Spectra', 99.99, 38, 'Bold chunky sneaker with retro aesthetics', 'White/Blue', '[{\"size\":8,\"quantity\":7},{\"size\":9,\"quantity\":7},{\"size\":10,\"quantity\":7},{\"size\":11,\"quantity\":6},{\"size\":12,\"quantity\":6},{\"size\":13,\"quantity\":5}]', '/uploads/products/images-1765500508429-488460150.png', '2024-12-01 10:00:00', '2025-12-12 00:48:28', 'none', 1),
(21, 5, 'Authentic', 49.99, 59, 'Timeless slip-on design with canvas upper', 'White', '[{\"size\":6,\"quantity\":10},{\"size\":7,\"quantity\":10},{\"size\":8,\"quantity\":10},{\"size\":9,\"quantity\":10},{\"size\":10,\"quantity\":10},{\"size\":11,\"quantity\":9}]', '/uploads/products/images-1765471291052-161323430.png', '2024-12-01 10:00:00', '2025-12-11 16:41:31', 'bestsellers', 1),
(22, 5, 'Sk8-Hi', 64.99, 38, 'High-top skate shoe with padded collar', 'Black/White', '[{\"size\":7,\"quantity\":7},{\"size\":8,\"quantity\":7},{\"size\":9,\"quantity\":7},{\"size\":10,\"quantity\":7},{\"size\":11,\"quantity\":4},{\"size\":12,\"quantity\":6}]', '/uploads/products/images-1765471260006-666232730.png', '2024-12-01 10:00:00', '2025-12-11 16:41:00', 'none', 1),
(23, 5, 'Old Skool', 59.99, 46, 'Classic skate shoe with side stripe', 'Black/White', '[{\"size\":7,\"quantity\":8},{\"size\":8,\"quantity\":8},{\"size\":9,\"quantity\":8},{\"size\":10,\"quantity\":8},{\"size\":11,\"quantity\":7},{\"size\":12,\"quantity\":7}]', '/uploads/products/images-1765500607104-757363731.png', '2024-12-01 10:00:00', '2025-12-12 00:50:07', 'bestsellers', 1),
(24, 5, 'Slip-On Pro', 69.99, 9, 'Professional skate shoe with Duracap reinforcement', 'Checkerboard', '[{\"size\":\"8\",\"quantity\":7},{\"size\":\"9\",\"quantity\":2}]', '/uploads/products/images-1765500741035-275346277.png', '2024-12-01 10:00:00', '2025-12-12 00:52:24', 'none', 1),
(25, 5, 'Era', 54.99, 37, 'Classic skate shoe with padded collar', 'Navy/White', '[{\"size\":8,\"quantity\":8},{\"size\":9,\"quantity\":8},{\"size\":10,\"quantity\":8},{\"size\":11,\"quantity\":7},{\"size\":13,\"quantity\":6}]', '/uploads/products/images-1765498507037-997244297.png', '2024-12-01 10:00:00', '2025-12-12 00:15:07', 'none', 1),
(26, 1, 'Air Jordan 4 ', 90.00, 0, 'the greatest shoe ever', NULL, '[]', '/uploads/products/images-1765702746529-648178760.jpg', '2025-12-11 20:45:51', '2025-12-14 08:59:06', 'none', 0),
(29, 1, 'hera', 90.00, 0, 'thisa is a great product', NULL, '[]', NULL, '2025-12-14 09:32:07', '2025-12-14 09:32:07', 'none', 1);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`, `created_at`) VALUES
(1, 'store_name', 'xsneakers', 'Name of the store displayed to customers', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(2, 'supplier_name', 'Supplier Name', 'Supplier company name', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(3, 'supplier_email', 'ranisupplier@gmail.com', 'Supplier contact email address', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(4, 'tax_rate', '0.9', 'Tax rate as decimal (e.g., 0.09 for 9%)', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(5, 'currency', 'ILS', 'Currency code (USD, ILS, EUR, etc.)', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(6, 'default_delivery_cost', '5.99', 'Default shipping cost', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(7, 'free_delivery_threshold', '200.01', 'Minimum order amount for free delivery', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(8, 'email_notification', 'ranitobassy17@gmail.com', 'Admin email for notifications', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(9, 'store_instagram', 'ranitobassy', 'Instagram handle without @', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(10, 'low_stock_threshold', '20', 'Overall low stock alert threshold', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(11, 'low_stock_threshold_per_size', '3', 'Per-size low stock threshold', '2025-12-13 18:24:09', '2025-10-12 14:52:23'),
(12, 'homepage_display_limit', '3', 'Number of products to show on homepage sections', '2025-12-13 18:24:09', '2025-10-12 14:52:23');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `wishlist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`wishlist`)),
  `password` varchar(255) NOT NULL,
  `role` enum('admin','customer') NOT NULL DEFAULT 'customer',
  `reset_code` varchar(10) DEFAULT NULL,
  `reset_code_expiry` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Address stored as JSON: {house_number, street, city, zipcode}' CHECK (json_valid(`address`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone_number`, `wishlist`, `password`, `role`, `reset_code`, `reset_code_expiry`, `created_at`, `address`) VALUES
(18, 'rani tobassy', 'ranitobassy17@gmail.com', NULL, '[33]', '$2b$10$Pe0WA8LESnU.hAgLY4ZbkeH1gywVldJbHgX86i01KsK4rvBM0yY.6', 'admin', NULL, NULL, '2024-05-01 06:00:00', NULL),
(100, 'David Cohen', 'davidcohen123@gmail.com', '0512345678', '[1,11,21]', '$2b$10$C8OBcV.Jf5K7AhWy.djIlecNDXgJBCcpSasEWvt6hSCraQtezYQPu', 'customer', NULL, NULL, '2024-03-15 10:30:00', '{\"house_number\":\"25\",\"street\":\"Herzl Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"61000\"}'),
(101, 'Sarah Levy', 'sarahlevy456@gmail.com', '0523456789', '[2,12,16]', '$2b$10$C8OBcV.Jf5K7AhWy.djIlecNDXgJBCcpSasEWvt6hSCraQtezYQPu', 'customer', NULL, NULL, '2024-04-20 14:15:00', '{\"house_number\":\"42\",\"street\":\"Dizengoff Street\",\"city\":\"Tel Aviv\",\"zipcode\":\"64332\"}'),
(102, 'Michael Ben David', 'michaelbd789@gmail.com', '0534567890', '[3,13,22]', '$2b$10$C8OBcV.Jf5K7AhWy.djIlecNDXgJBCcpSasEWvt6hSCraQtezYQPu', 'customer', NULL, NULL, '2024-05-10 09:20:00', '{\"house_number\":\"18\",\"street\":\"Rothschild Boulevard\",\"city\":\"Tel Aviv\",\"zipcode\":\"66881\"}'),
(103, 'Rachel Mizrahi', 'rachelmiz012@gmail.com', '0545678901', '[6,16,23]', '$2b$10$C8OBcV.Jf5K7AhWy.djIlecNDXgJBCcpSasEWvt6hSCraQtezYQPu', 'customer', NULL, NULL, '2024-06-05 16:45:00', '{\"house_number\":\"33\",\"street\":\"King George Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(104, 'Jonathan Ashkenazi', 'jonathanash345@gmail.com', '0556789012', '[7,17,24]', '$2b$10$C8OBcV.Jf5K7AhWy.djIlecNDXgJBCcpSasEWvt6hSCraQtezYQPu', 'customer', NULL, NULL, '2024-07-12 11:30:00', '{\"house_number\":\"56\",\"street\":\"Ben Yehuda Street\",\"city\":\"Jerusalem\",\"zipcode\":\"91000\"}'),
(105, 'Leah Friedman', 'leahfried678@gmail.com', '0567890123', '[8,18,25]', '$2b$10$C8OBcV.Jf5K7AhWy.djIlecNDXgJBCcpSasEWvt6hSCraQtezYQPu', 'customer', NULL, NULL, '2024-08-18 13:00:00', '{\"house_number\":\"12\",\"street\":\"Allenby Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(106, 'Daniel Rosen', 'danielrosen901@gmail.com', '0578901234', NULL, '$2b$10$C8OBcV.Jf5K7AhWy.djIlecNDXgJBCcpSasEWvt6hSCraQtezYQPu', 'customer', NULL, NULL, '2024-09-22 15:20:00', '{\"house_number\":\"78\",\"street\":\"Herzl Street\",\"city\":\"Haifa\",\"zipcode\":\"31000\"}'),
(107, 'Miriam Gold', 'miriambgold234@gmail.com', '0589012345', '[10,20]', '$2b$10$C8OBcV.Jf5K7AhWy.djIlecNDXgJBCcpSasEWvt6hSCraQtezYQPu', 'customer', NULL, NULL, '2024-10-28 10:10:00', '{\"house_number\":\"91\",\"street\":\"Weizmann Street\",\"city\":\"Beer Sheva\",\"zipcode\":\"84100\"}'),
(108, 'rani tobassy', 'rtobassy@gmail.com', NULL, '[23]', '$2b$10$c4dOtywWzmX0JHMOauOjYeuoXxNvIOWB.91QgA652yhTsXolcgaMm', 'customer', NULL, NULL, '2025-12-11 16:04:27', '{\"house_number\":\"17\",\"street\":\"fgdfgf\",\"city\":\"haifa\",\"zipcode\":\"202000\"}'),
(109, 'rani tobassy', 'sean.ramos@gmail.com', NULL, NULL, '$2b$10$p2/YlUQIQSoEpgtJ.z/y8.bsh6fuIC/.PluHaVEen0c7GKxF/u4wy', 'customer', NULL, NULL, '2025-12-12 14:37:28', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action_type` (`action_type`),
  ADD KEY `idx_entity_type` (`entity_type`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_email` (`user_email`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`),
  ADD UNIQUE KEY `unique_user_cart` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`),
  ADD UNIQUE KEY `unique_cart_product` (`cart_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `idx_sender_user_id` (`sender_user_id`),
  ADD KEY `idx_message_type` (`message_type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `fk_msg_order` (`order_id`),
  ADD KEY `fk_msg_product` (`product_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_created_at` (`created_at`),
  ADD KEY `idx_products_updated_at` (`updated_at`),
  ADD KEY `idx_products_is_active` (`is_active`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_setting_key` (`setting_key`),
  ADD KEY `idx_setting_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=194;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=440;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `fk_msg_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_msg_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
