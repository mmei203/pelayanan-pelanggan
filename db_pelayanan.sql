-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for db_pelayanan
CREATE DATABASE IF NOT EXISTS `db_pelayanan` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_pelayanan`;

-- Dumping structure for table db_pelayanan.tabel_pelanggan
CREATE TABLE IF NOT EXISTS `tabel_pelanggan` (
  `id_pelanggan` int unsigned NOT NULL AUTO_INCREMENT,
  `no_kontak_pdam` varchar(50) NOT NULL,
  `nama_pelanggan` varchar(100) NOT NULL,
  `no_hp` varchar(20) NOT NULL,
  `alamat` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pelanggan`),
  UNIQUE KEY `no_kontak_pdam` (`no_kontak_pdam`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_pelayanan.tabel_pelanggan: ~2 rows (approximately)
REPLACE INTO `tabel_pelanggan` (`id_pelanggan`, `no_kontak_pdam`, `nama_pelanggan`, `no_hp`, `alamat`, `created_at`) VALUES
	(2, 'PDAM-002', 'Pelanggan 2', '082345678901', 'Jl. Ahmad Yani Km 4.5', '2026-08-18 01:35:38'),
	(3, 'PDAM-003', 'Pelanggan 3', '083456789012', 'Jl. Hasan Basri No. 12', '2026-08-18 01:35:38');

-- Dumping structure for table db_pelayanan.tabel_pengaduan
CREATE TABLE IF NOT EXISTS `tabel_pengaduan` (
  `id_pengaduan` int unsigned NOT NULL AUTO_INCREMENT,
  `id_pelanggan` int unsigned NOT NULL,
  `id_user` int unsigned DEFAULT NULL,
  `keluhan` text NOT NULL,
  `status` enum('Pending','On Progress','Selesai') NOT NULL DEFAULT 'Pending',
  `tanggal_diterima` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pengaduan`),
  KEY `fk_pengaduan_pelanggan` (`id_pelanggan`),
  KEY `fk_pengaduan_user` (`id_user`),
  CONSTRAINT `fk_pengaduan_pelanggan` FOREIGN KEY (`id_pelanggan`) REFERENCES `tabel_pelanggan` (`id_pelanggan`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pengaduan_user` FOREIGN KEY (`id_user`) REFERENCES `tabel_user` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_pelayanan.tabel_pengaduan: ~2 rows (approximately)
REPLACE INTO `tabel_pengaduan` (`id_pengaduan`, `id_pelanggan`, `id_user`, `keluhan`, `status`, `tanggal_diterima`, `created_at`, `updated_at`) VALUES
	(2, 2, NULL, 'Air Keruh dan Berbau', 'On Progress', '2026-08-18 09:35:38', '2026-08-18 01:35:38', '2026-08-18 01:35:38'),
	(3, 3, 3, 'Pipa Kebocoran Depan Rumah', 'Selesai', '2026-08-18 09:35:38', '2026-08-18 01:35:38', '2026-08-18 01:35:38');

-- Dumping structure for table db_pelayanan.tabel_user
CREATE TABLE IF NOT EXISTS `tabel_user` (
  `id_user` int unsigned NOT NULL AUTO_INCREMENT,
  `nama_user` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_pelayanan.tabel_user: ~2 rows (approximately)
REPLACE INTO `tabel_user` (`id_user`, `nama_user`, `username`, `password`) VALUES
	(1, 'Admin Utama', 'admin', '123'),
	(3, 'Siti CS', 'sitics', '123');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
