/*
  Warnings:

  - You are about to drop the column `keluhan` on the `Pelanggan` table. All the data in the column will be lost.
  - You are about to drop the column `noPdam` on the `Pelanggan` table. All the data in the column will be lost.
  - You are about to drop the column `noTelp` on the `Pelanggan` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Pelanggan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Pelanggan` DROP COLUMN `keluhan`,
    DROP COLUMN `noPdam`,
    DROP COLUMN `noTelp`,
    DROP COLUMN `status`;
