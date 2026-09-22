import { prisma } from "../config/db.js";

// GET All Pelanggan & Filter by Search Keyword
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
				penangani: {
					select: { namaUser: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		res.status(200).json({
			success: true,
			data: pengaduanList,
		});
	} catch (error) {
		next(error);
	}
};

// GET Pelanggan By Status
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

		res.status(200).json({
			success: true,
			data: pengaduanList,
		});
	} catch (error) {
		next(error);
	}
};

// GET Pelanggan By ID
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

		res.status(200).json({ success: true, data: pengaduan });
	} catch (error) {
		next(error);
	}
};

// POST Pelanggan & Pengaduan (Diinput CS)
export const createPelanggan = async (req, res, next) => {
	try {
		const { namaPelanggan, noHp, noKontakPdam, alamat, keluhan, idUserCS } =
			req.body;

		if (!idUserCS) {
			return res.status(400).json({
				success: false,
				message: "idUserCS wajib diisi",
			});
		}

		const result = await prisma.$transaction(async (tx) => {
			// 1. Buat data pelanggan
			const pelangganBaru = await tx.tabelPelanggan.create({
				data: {
					namaPelanggan,
					noHp,
					noKontakPdam,
					alamat,
				},
			});

			// 2. Buat data pengaduan
			const pengaduanBaru = await tx.tabelPengaduan.create({
				data: {
					idPelanggan: pelangganBaru.idPelanggan,
					idUser: idUserCS,
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

// PUT Update Status Pelanggan (Terima / Selesai oleh Operator)
export const updatePelanggan = async (req, res, next) => {
	try {
		const { id } = req.params;
		const {
			status,
			operatorId,
			latitude,
			longitude,
			namaPelanggan,
			noHp,
			noKontakPdam,
			alamat,
			keluhan,
		} = req.body;

		const updateData = {};

		// 1. Operator Klik "Terima Keluhan" -> PENDING -> ON PROGRESS
		if (status === "ON PROGRESS") {
			updateData.status = "ON PROGRESS";
			updateData.tabIdUser = operatorId;
			updateData.tanggalDiproses = new Date();
		}

		// 2. Operator Klik "Simpan Perubahan" -> ON PROGRESS -> SELESAI
		if (status === "SELESAI") {
			updateData.status = "SELESAI";
			updateData.latitude = latitude;
			updateData.longitude = longitude;
			updateData.tanggalSelesai = new Date();

			if (req.files?.dokumenLaporan?.[0]) {
				updateData.dokumenLaporan = req.files.dokumenLaporan[0].path;
			}
			if (req.files?.fotoKeluhan?.[0]) {
				updateData.fotoKeluhan = req.files.fotoKeluhan[0].path;
			}
		}

		const updatedPengaduan = await prisma.tabelPengaduan.update({
			where: { idPengaduan: id },
			data: updateData,
			include: { pelanggan: true },
		});

		// Update opsional data identitas pelanggan jika dikirimkan
		if (namaPelanggan || noHp || noKontakPdam || alamat) {
			await prisma.tabelPelanggan.update({
				where: { idPelanggan: updatedPengaduan.idPelanggan },
				data: {
					...(namaPelanggan && { namaPelanggan }),
					...(noHp && { noHp }),
					...(noKontakPdam && { noKontakPdam }),
					...(alamat && { alamat }),
				},
			});
		}

		res.status(200).json({
			success: true,
			message: "Data pengaduan berhasil diperbarui",
			data: updatedPengaduan,
		});
	} catch (error) {
		next(error);
	}
};

// GET History (Pengaduan Selesai)
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
			select: {
				idPengaduan: true,
				keluhan: true,
				tanggalDiterima: true,
				tanggalSelesai: true,
				pelanggan: {
					select: { namaPelanggan: true },
				},
				penangani: {
					select: { namaUser: true },
				},
			},
			orderBy: { tanggalSelesai: "desc" },
		});

		res.status(200).json({
			success: true,
			data: history,
		});
	} catch (error) {
		next(error);
	}
};
