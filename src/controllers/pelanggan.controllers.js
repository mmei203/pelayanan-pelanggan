import { prisma } from "../config/db.js";
import { formatFileUrl } from "../utils/url.helper.js";

export const getAllPelanggan = async (req, res, next) => {
	try {
		const { search } = req.query;

		const whereCondition = search
			? {
					pelanggan: {
						namaPelanggan: { contains: search },
					},
				}
			: {};

		const pengaduanList = await prisma.tabelPengaduan.findMany({
			where: whereCondition,
			include: {
				pelanggan: true,
				penerima: { select: { namaUser: true, role: true } },
				penangani: { select: { namaUser: true, role: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		const formattedData = pengaduanList.map((item) => ({
			...item,
			dokumenLaporan: formatFileUrl(req, item.dokumenLaporan),
			fotoKeluhan: formatFileUrl(req, item.fotoKeluhan),
		}));

		res.status(200).json({ success: true, data: formattedData });
	} catch (error) {
		next(error);
	}
};

export const getPelangganByStatus = async (req, res, next) => {
	try {
		const { status } = req.query;

		const pengaduanList = await prisma.tabelPengaduan.findMany({
			where: status ? { status: status.toUpperCase() } : {},
			include: {
				pelanggan: true,
				penangani: { select: { namaUser: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		const formattedData = pengaduanList.map((item) => ({
			...item,
			dokumenLaporan: formatFileUrl(req, item.dokumenLaporan),
			fotoKeluhan: formatFileUrl(req, item.fotoKeluhan),
		}));

		res.status(200).json({ success: true, data: formattedData });
	} catch (error) {
		next(error);
	}
};

export const getPelangganById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const pengaduan = await prisma.tabelPengaduan.findUnique({
			where: { idPengaduan: id },
			include: {
				pelanggan: true,
				penerima: { select: { namaUser: true, role: true } },
				penangani: { select: { namaUser: true, role: true } },
			},
		});

		if (!pengaduan) {
			return res
				.status(404)
				.json({ success: false, message: "Data pengaduan tidak ditemukan" });
		}

		const formattedData = {
			...pengaduan,
			dokumenLaporan: formatFileUrl(req, pengaduan.dokumenLaporan),
			fotoKeluhan: formatFileUrl(req, pengaduan.fotoKeluhan),
		};

		res.status(200).json({ success: true, data: formattedData });
	} catch (error) {
		next(error);
	}
};

export const createPelanggan = async (req, res, next) => {
	try {
		const { namaPelanggan, noHp, noKontakPdam, alamat, keluhan, idUserCS } =
			req.body;

		if (!idUserCS) {
			return res
				.status(400)
				.json({ success: false, message: "idUserCS wajib diisi" });
		}

		const result = await prisma.$transaction(async (tx) => {
			const pelangganBaru = await tx.tabelPelanggan.create({
				data: { namaPelanggan, noHp, noKontakPdam, alamat },
			});

			const pengaduanBaru = await tx.tabelPengaduan.create({
				data: {
					idPelanggan: pelangganBaru.idPelanggan,
					idUserPenerima: idUserCS,
					keluhan,
					status: "PENDING",
					tanggalDiterima: new Date(),
				},
			});

			return { pelangganBaru, pengaduanBaru };
		});

		res.status(201).json({
			success: true,
			message: "Pengaduan berhasil ditambahkan",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const updatePelanggan = async (req, res, next) => {
	try {
		const { id } = req.params;
		const rawStatus = req.body.status
			? req.body.status.replace(/"/g, "").trim()
			: "";
		const {
			operatorId,
			latitude,
			longitude,
			namaPelanggan,
			noHp,
			noKontakPdam,
			alamat,
			keluhan,
		} = req.body;

		const pengaduanExist = await prisma.tabelPengaduan.findUnique({
			where: { idPengaduan: id },
			include: { pelanggan: true },
		});

		if (!pengaduanExist) {
			return res
				.status(404)
				.json({ success: false, message: "Data pengaduan tidak ditemukan" });
		}

		// 1. Update Data Pelanggan (Bisa dilakukan kapan saja tanpa terikat status)
		if (namaPelanggan || noHp || noKontakPdam || alamat) {
			await prisma.tabelPelanggan.update({
				where: { idPelanggan: pengaduanExist.idPelanggan },
				data: {
					...(namaPelanggan && { namaPelanggan }),
					...(noHp && { noHp }),
					...(noKontakPdam && { noKontakPdam }),
					...(alamat && { alamat }),
				},
			});
		}

		// 2. Handle Update Berdasarkan Status (Jika status dikirimkan)
		if (rawStatus === "ON PROGRESS") {
			const updated = await prisma.tabelPengaduan.update({
				where: { idPengaduan: id },
				data: {
					status: "ON PROGRESS",
					...(operatorId && { idUserPenanganan: operatorId }),
					...(keluhan && { keluhan }),
					tanggalDiproses: new Date(),
				},
				include: { pelanggan: true },
			});

			const formattedData = {
				...updated,
				dokumenLaporan: formatFileUrl(req, updated.dokumenLaporan),
				fotoKeluhan: formatFileUrl(req, updated.fotoKeluhan),
			};

			return res.status(200).json({
				success: true,
				message: "Data berhasil diperbarui menjadi ON PROGRESS",
				data: formattedData,
			});
		}

		if (rawStatus === "SELESAI") {
			const dokumenLaporanPath =
				req.files?.dokumenLaporan?.[0]?.path || pengaduanExist.dokumenLaporan;
			const fotoKeluhanPath =
				req.files?.fotoKeluhan?.[0]?.path || pengaduanExist.fotoKeluhan;

			const updated = await prisma.tabelPengaduan.update({
				where: { idPengaduan: id },
				data: {
					status: "SELESAI",
					...(latitude && { latitude }),
					...(longitude && { longitude }),
					...(dokumenLaporanPath && { dokumenLaporan: dokumenLaporanPath }),
					...(fotoKeluhanPath && { fotoKeluhan: fotoKeluhanPath }),
					...(keluhan && { keluhan }),
					...(operatorId && { idUserPenanganan: operatorId }),
					tanggalSelesai: new Date(),
				},
				include: { pelanggan: true },
			});

			const formattedData = {
				...updated,
				dokumenLaporan: formatFileUrl(req, updated.dokumenLaporan),
				fotoKeluhan: formatFileUrl(req, updated.fotoKeluhan),
			};

			return res.status(200).json({
				success: true,
				message: "Data pengaduan berhasil diselesaikan dan diperbarui",
				data: formattedData,
			});
		}

		// 3. Jika status kosong atau hanya ingin mengedit data teks (misal: ubah nama, alamat, keluhan tanpa mengubah status)
		const updateDataPayload = {};
		if (keluhan) updateDataPayload.keluhan = keluhan;
		if (operatorId) updateDataPayload.idUserPenanganan = operatorId;

		const updated = await prisma.tabelPengaduan.update({
			where: { idPengaduan: id },
			data: updateDataPayload,
			include: { pelanggan: true },
		});

		const formattedData = {
			...updated,
			dokumenLaporan: formatFileUrl(req, updated.dokumenLaporan),
			fotoKeluhan: formatFileUrl(req, updated.fotoKeluhan),
		};

		return res.status(200).json({
			success: true,
			message: "Data pelanggan dan pengaduan berhasil diperbarui",
			data: formattedData,
		});
	} catch (error) {
		next(error);
	}
};

export const getHistory = async (req, res, next) => {
	try {
		const { search } = req.query;

		const history = await prisma.tabelPengaduan.findMany({
			where: {
				status: "SELESAI",
				...(search && {
					pelanggan: {
						namaPelanggan: { contains: search },
					},
				}),
			},
			include: {
				pelanggan: true,
				penerima: { select: { namaUser: true } },
				penangani: { select: { namaUser: true } },
			},
			orderBy: { tanggalSelesai: "desc" },
		});

		const formattedData = history.map((item) => ({
			...item,
			dokumenLaporan: formatFileUrl(req, item.dokumenLaporan),
			fotoKeluhan: formatFileUrl(req, item.fotoKeluhan),
		}));

		res.status(200).json({ success: true, data: formattedData });
	} catch (error) {
		next(error);
	}
};
