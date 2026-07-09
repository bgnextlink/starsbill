-- phpMyAdmin SQL Dump
-- Host: localhost
-- Generation Time: Jul 09, 2026
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `starbilling`
--
CREATE DATABASE IF NOT EXISTS `starbilling` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `starbilling`;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE IF NOT EXISTS `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_number` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `status` enum('active','suspended','terminated') DEFAULT 'active',
  `connection_type` enum('pppoe','hotspot','static') DEFAULT 'pppoe',
  `username_ppp` varchar(100) DEFAULT NULL,
  `password_ppp` varchar(100) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `mac_address` varchar(50) DEFAULT NULL,
  `package_id` int(11) DEFAULT NULL,
  `router_id` int(11) DEFAULT NULL,
  `odp_id` int(11) DEFAULT NULL,
  `billing_cycle` int(11) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `month` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('paid','unpaid','overdue') DEFAULT 'unpaid',
  `due_date` date NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `routers`
--

CREATE TABLE IF NOT EXISTS `routers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `ip_address` varchar(50) NOT NULL,
  `api_port` int(11) DEFAULT 8728,
  `api_username` varchar(100) NOT NULL,
  `api_password` varchar(100) DEFAULT NULL,
  `status` enum('connected','disconnected','error') DEFAULT 'disconnected',
  `auto_isolate` tinyint(1) DEFAULT 1,
  `isolation_action` enum('disable','address_list') DEFAULT 'disable',
  `default_profile` varchar(50) DEFAULT 'default',
  `active_mode` enum('api','ssh') DEFAULT 'api',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(50) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `issue` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `assigned_to` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `wa_settings`
--

CREATE TABLE IF NOT EXISTS `wa_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `api_endpoint` varchar(255) NOT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `template_new_invoice` text,
  `template_payment_success` text,
  `template_isolation_warning` text,
  `template_isolated` text,
  `is_active` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Seed data for testing
--

INSERT INTO `customers` (`customer_number`, `name`, `phone`, `status`) VALUES
('CUST-001', 'Budi Santoso', '081234567890', 'active'),
('CUST-002', 'Ani Yudhoyono', '081987654321', 'active');

INSERT INTO `routers` (`name`, `ip_address`, `api_username`) VALUES
('Router Utama', '192.168.1.1', 'admin');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

--
-- Table structure for table `acs_servers`
--

CREATE TABLE IF NOT EXISTS `acs_servers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `url` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `status` enum('connected','error') DEFAULT 'connected',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

