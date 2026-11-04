import { prisma } from "../config/db.js";
import { formatFileUrl } from "../utils/url.helper.js";
import { generateFormulirAduanPelangganPDF } from "../utils/pdf.helper.js";

// Helper normalisasi ENUM sumberAduan
const parseSumberAduan = (value) => {
	if (!value) return undefined;
	const val = String(value).trim().toLowerCase();
	if (val === "non_pelangan" || val === "non pelangan" || val === "non_pelanggan" || val === "non pelanggan" || val === "non") {
		return "Non_Pelangan";
	}
	if (val === "pelanggan") {
		return "Pelanggan";
	}
	return undefined;
};

// Helper normalisasi ENUM saluranKeluhan
const parseSaluranKeluhan = (value) => {
	if (!value) return undefined;
	const val = String(value).trim().toLowerCase();
	if (val === "whatsapp" || val === "wa") return "WhatsApp";
	if (val === "telepon" || val === "telp") return "Telepon";
	if (val === "datang ketempat" || val === "datang_ketempat" || val === "datang langsung") return "Datang_Ketempat";
	return undefined;
};

export const getAllPelanggan = async (req, res, next) => {
	try {
		const { search, sumberAduan, saluranKeluhan } = req.query;

		const parsedSumber = parseSumberAduan(sumberAduan);
		const parsedSaluran = parseSaluranKeluhan(saluranKeluhan);

		const whereCondition = {
			...(search && {
				pelanggan: {
					namaPelanggan: { contains: search },
				},
			}),
			...(parsedSumber && { sumberAduan: parsedSumber }),
			...(parsedSaluran && { saluranKeluhan: parsedSaluran }),
		};

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
		const { status, sumberAduan, saluranKeluhan } = req.query;

		const parsedSumber = parseSumberAduan(sumberAduan);
		const parsedSaluran = parseSaluranKeluhan(saluranKeluhan);

		const pengaduanList = await prisma.tabelPengaduan.findMany({
			where: {
				...(status && { status: status.toUpperCase() }),
				...(parsedSumber && { sumberAduan: parsedSumber }),
				...(parsedSaluran && { saluranKeluhan: parsedSaluran }),
			},
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
		const {
			namaPelanggan,
			noHp,
			noKontakPdam,
			alamat,
			keluhan,
			idUserCS,
			sumberAduan,
			saluranKeluhan,
		} = req.body;

		if (!idUserCS) {
			return res
				.status(400)
				.json({ success: false, message: "idUserCS wajib diisi" });
		}

		// Validasi / penentuan sumberAduan (Pelanggan / Non Pelangan)
		// Jika frontend tidak mengirim, otomatis cek nomor kontrak PDAM
		let resolvedSumberAduan = parseSumberAduan(sumberAduan);
		if (!resolvedSumberAduan) {
			resolvedSumberAduan = noKontakPdam && noKontakPdam.trim() !== "" ? "Pelanggan" : "Non_Pelangan";
		}

		const resolvedSaluranKeluhan = parseSaluranKeluhan(saluranKeluhan) || "WhatsApp";

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
					sumberAduan: resolvedSumberAduan,
					saluranKeluhan: resolvedSaluranKeluhan,
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
			sumberAduan,
			saluranKeluhan,
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
		if (namaPelanggan || noHp || noKontakPdam !== undefined || alamat) {
			await prisma.tabelPelanggan.update({
				where: { idPelanggan: pengaduanExist.idPelanggan },
				data: {
					...(namaPelanggan && { namaPelanggan }),
					...(noHp && { noHp }),
					...(noKontakPdam !== undefined && { noKontakPdam }),
					...(alamat && { alamat }),
				},
			});
		}

		// Siapkan payload opsional untuk pengaduan
		const extraPengaduanFields = {};
		const parsedSumber = parseSumberAduan(sumberAduan);
		if (parsedSumber) extraPengaduanFields.sumberAduan = parsedSumber;
		const parsedSaluran = parseSaluranKeluhan(saluranKeluhan);
		if (parsedSaluran) extraPengaduanFields.saluranKeluhan = parsedSaluran;

		// 2. Handle Update Berdasarkan Status (Jika status dikirimkan)
		if (rawStatus === "ON PROGRESS") {
			const updated = await prisma.tabelPengaduan.update({
				where: { idPengaduan: id },
				data: {
					status: "ON PROGRESS",
					...(operatorId && { idUserPenanganan: operatorId }),
					...(keluhan && { keluhan }),
					tanggalDiproses: new Date(),
					...extraPengaduanFields,
				},
				include: {
					pelanggan: true,
					penerima: { select: { namaUser: true, role: true } },
					penangani: { select: { namaUser: true, role: true } },
				},
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
					...extraPengaduanFields,
				},
				include: {
					pelanggan: true,
					penerima: { select: { namaUser: true, role: true } },
					penangani: { select: { namaUser: true, role: true } },
				},
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
		const updateDataPayload = { ...extraPengaduanFields };
		if (keluhan) updateDataPayload.keluhan = keluhan;
		if (operatorId) updateDataPayload.idUserPenanganan = operatorId;

		const updated = await prisma.tabelPengaduan.update({
			where: { idPengaduan: id },
			data: updateDataPayload,
			include: {
				pelanggan: true,
				penerima: { select: { namaUser: true, role: true } },
				penangani: { select: { namaUser: true, role: true } },
			},
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
		const { search, sumberAduan, saluranKeluhan } = req.query;

		const parsedSumber = parseSumberAduan(sumberAduan);
		const parsedSaluran = parseSaluranKeluhan(saluranKeluhan);

		const history = await prisma.tabelPengaduan.findMany({
			where: {
				status: "SELESAI",
				...(search && {
					pelanggan: {
						namaPelanggan: { contains: search },
					},
				}),
				...(parsedSumber && { sumberAduan: parsedSumber }),
				...(parsedSaluran && { saluranKeluhan: parsedSaluran }),
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

export const printPengaduan = async (req, res, next) => {
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

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`inline; filename="formulir-aduan-${id}.pdf"`
		);

		generateFormulirAduanPelangganPDF(pengaduan, res);
	} catch (error) {
		next(error);
	}
};
