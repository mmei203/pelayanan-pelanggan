-- CreateTable
CREATE TABLE `tabel_pelanggan` (
    `id_pelanggan` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `no_kontak_pdam` VARCHAR(50) NOT NULL,
    `nama_pelanggan` VARCHAR(100) NOT NULL,
    `no_hp` VARCHAR(20) NOT NULL,
    `alamat` TEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `no_kontak_pdam`(`no_kontak_pdam`),
    PRIMARY KEY (`id_pelanggan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tabel_pengaduan` (
    `id_pengaduan` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pelanggan` INTEGER UNSIGNED NOT NULL,
    `id_user` INTEGER UNSIGNED NULL,
    `keluhan` TEXT NOT NULL,
    `status` ENUM('Pending', 'On Progress', 'Selesai') NOT NULL DEFAULT 'Pending',
    `tanggal_diterima` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_pengaduan_pelanggan`(`id_pelanggan`),
    INDEX `fk_pengaduan_user`(`id_user`),
    PRIMARY KEY (`id_pengaduan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tabel_user` (
    `id_user` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_user` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tabel_pengaduan` ADD CONSTRAINT `fk_pengaduan_pelanggan` FOREIGN KEY (`id_pelanggan`) REFERENCES `tabel_pelanggan`(`id_pelanggan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tabel_pengaduan` ADD CONSTRAINT `fk_pengaduan_user` FOREIGN KEY (`id_user`) REFERENCES `tabel_user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

