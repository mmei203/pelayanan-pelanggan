-- CreateTable
CREATE TABLE `Pelanggan` (
    `id` VARCHAR(191) NOT NULL,
    `namaPelanggan` VARCHAR(191) NOT NULL,
    `noPdam` INTEGER NOT NULL,
    `keluhan` TEXT NOT NULL,
    `noTelp` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ON_PROGRESS', 'SELESAI') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
