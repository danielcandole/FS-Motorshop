-- phpMyAdmin SQL Dump
-- version 5.2.2deb1+deb13u1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 28, 2026 at 02:43 PM
-- Server version: 11.8.8-MariaDB-0+deb13u1 from Debian
-- PHP Version: 8.4.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fs_motorshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `customerRecord`
--

CREATE TABLE `customerRecord` (
  `customerRecordId` int(10) UNSIGNED NOT NULL,
  `customerName` varchar(100) NOT NULL,
  `contactNo` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employeeAccount`
--

CREATE TABLE `employeeAccount` (
  `employeeAccountId` int(10) UNSIGNED NOT NULL,
  `roleId` int(10) UNSIGNED NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `contactNumber` varchar(20) NOT NULL,
  `address` varchar(255) NOT NULL,
  `accountStatus` varchar(20) NOT NULL DEFAULT 'active',
  `profilePicture` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employeeSession`
--

CREATE TABLE `employeeSession` (
  `employeeSessionId` int(10) UNSIGNED NOT NULL,
  `employeeAccountId` int(10) UNSIGNED NOT NULL,
  `sessionTokenHash` char(64) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `csrfTokenHash` char(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventoryItem`
--

CREATE TABLE `inventoryItem` (
  `inventoryItemId` int(10) UNSIGNED NOT NULL,
  `supplierId` int(10) UNSIGNED NOT NULL,
  `itemName` varchar(150) NOT NULL,
  `itemCode` varchar(100) DEFAULT NULL,
  `itemCategory` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `motorcycleFitment` varchar(255) DEFAULT NULL,
  `costPrice` decimal(10,2) NOT NULL,
  `sellingPrice` decimal(10,2) NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobOrder`
--

CREATE TABLE `jobOrder` (
  `jobOrderId` int(10) UNSIGNED NOT NULL,
  `employeeAccountId` int(10) UNSIGNED DEFAULT NULL,
  `motorcycleRecordId` int(10) UNSIGNED NOT NULL,
  `repairDate` datetime NOT NULL,
  `description` text DEFAULT NULL,
  `repairStatus` enum('pending','in-progress','done') NOT NULL DEFAULT 'pending',
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `motorcycleRecord`
--

CREATE TABLE `motorcycleRecord` (
  `motorcycleRecordId` int(10) UNSIGNED NOT NULL,
  `customerRecordId` int(10) UNSIGNED NOT NULL,
  `motorcycleName` varchar(100) NOT NULL,
  `motorcycleModel` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `permissionId` int(10) UNSIGNED NOT NULL,
  `permissionName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `roleId` int(10) UNSIGNED NOT NULL,
  `roleName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rolePermission`
--

CREATE TABLE `rolePermission` (
  `roleId` int(10) UNSIGNED NOT NULL,
  `permissionId` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `supplierId` int(10) UNSIGNED NOT NULL,
  `supplierName` varchar(150) NOT NULL,
  `supplierContactNo` varchar(20) NOT NULL,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customerRecord`
--
ALTER TABLE `customerRecord`
  ADD PRIMARY KEY (`customerRecordId`);

--
-- Indexes for table `employeeAccount`
--
ALTER TABLE `employeeAccount`
  ADD PRIMARY KEY (`employeeAccountId`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_employeeAccount_role` (`roleId`);

--
-- Indexes for table `employeeSession`
--
ALTER TABLE `employeeSession`
  ADD PRIMARY KEY (`employeeSessionId`),
  ADD UNIQUE KEY `sessionTokenHash` (`sessionTokenHash`),
  ADD KEY `employeeAccountId` (`employeeAccountId`);

--
-- Indexes for table `inventoryItem`
--
ALTER TABLE `inventoryItem`
  ADD PRIMARY KEY (`inventoryItemId`),
  ADD KEY `fk_inventoryItem_supplier` (`supplierId`);

--
-- Indexes for table `jobOrder`
--
ALTER TABLE `jobOrder`
  ADD PRIMARY KEY (`jobOrderId`),
  ADD KEY `fk_jobOrder_motorcycleRecord` (`motorcycleRecordId`),
  ADD KEY `fk_jobOrder_employeeAccount` (`employeeAccountId`);

--
-- Indexes for table `motorcycleRecord`
--
ALTER TABLE `motorcycleRecord`
  ADD PRIMARY KEY (`motorcycleRecordId`),
  ADD KEY `fk_motorcycleRecord_customerRecord` (`customerRecordId`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`permissionId`),
  ADD UNIQUE KEY `permissionName` (`permissionName`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`roleId`),
  ADD UNIQUE KEY `roleName` (`roleName`);

--
-- Indexes for table `rolePermission`
--
ALTER TABLE `rolePermission`
  ADD PRIMARY KEY (`roleId`,`permissionId`),
  ADD KEY `fk_rolePermission_permission` (`permissionId`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`supplierId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customerRecord`
--
ALTER TABLE `customerRecord`
  MODIFY `customerRecordId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employeeAccount`
--
ALTER TABLE `employeeAccount`
  MODIFY `employeeAccountId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employeeSession`
--
ALTER TABLE `employeeSession`
  MODIFY `employeeSessionId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventoryItem`
--
ALTER TABLE `inventoryItem`
  MODIFY `inventoryItemId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobOrder`
--
ALTER TABLE `jobOrder`
  MODIFY `jobOrderId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `motorcycleRecord`
--
ALTER TABLE `motorcycleRecord`
  MODIFY `motorcycleRecordId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `permissionId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `roleId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `supplierId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employeeAccount`
--
ALTER TABLE `employeeAccount`
  ADD CONSTRAINT `fk_employeeAccount_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`roleId`) ON UPDATE CASCADE;

--
-- Constraints for table `employeeSession`
--
ALTER TABLE `employeeSession`
  ADD CONSTRAINT `employeeSession_ibfk_1` FOREIGN KEY (`employeeAccountId`) REFERENCES `employeeAccount` (`employeeAccountId`) ON DELETE CASCADE;

--
-- Constraints for table `inventoryItem`
--
ALTER TABLE `inventoryItem`
  ADD CONSTRAINT `fk_inventoryItem_supplier` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`supplierId`);

--
-- Constraints for table `jobOrder`
--
ALTER TABLE `jobOrder`
  ADD CONSTRAINT `fk_jobOrder_employeeAccount` FOREIGN KEY (`employeeAccountId`) REFERENCES `employeeAccount` (`employeeAccountId`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_jobOrder_motorcycleRecord` FOREIGN KEY (`motorcycleRecordId`) REFERENCES `motorcycleRecord` (`motorcycleRecordId`) ON UPDATE CASCADE;

--
-- Constraints for table `motorcycleRecord`
--
ALTER TABLE `motorcycleRecord`
  ADD CONSTRAINT `fk_motorcycleRecord_customerRecord` FOREIGN KEY (`customerRecordId`) REFERENCES `customerRecord` (`customerRecordId`) ON UPDATE CASCADE;

--
-- Constraints for table `rolePermission`
--
ALTER TABLE `rolePermission`
  ADD CONSTRAINT `fk_rolePermission_permission` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`permissionId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rolePermission_role` FOREIGN KEY (`roleId`) REFERENCES `role` (`roleId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
