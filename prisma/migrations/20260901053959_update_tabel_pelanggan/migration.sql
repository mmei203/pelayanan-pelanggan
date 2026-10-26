/*
  Warnings:

  - Added the required column `alamat` to the `Pelanggan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keluhan` to the `Pelanggan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noPdam` to the `Pelanggan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noTelp` to the `Pelanggan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusPelanggan` to the `Pelanggan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pelanggan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Pelanggan` ADD COLUMN `alamat` TEXT NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `keluhan` TEXT NOT NULL,
    ADD COLUMN `noPdam` INTEGER NOT NULL,
    ADD COLUMN `noTelp` INTEGER NOT NULL,
    ADD COLUMN `statusPelanggan` ENUM('PENDING', 'ON_PROGRESS', 'SELESAI') NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `namaPelanggan` VARCHAR(500) NOT NULL;
