import PDFDocument from "pdfkit";

/**
 * Generate PDF Formulir Aduan Pelanggan (PERUMDA PALD BANJARMASIN)
 * Sesuai format fisik cetak form.
 */
export const generateFormulirAduanPelangganPDF = (pengaduan, stream) => {
	// Buat dokumen PDF ukuran A4 (margin 36pt = 0.5 inci)
	const doc = new PDFDocument({
		size: "A4",
		margins: { top: 36, bottom: 36, left: 40, right: 40 },
	});

	doc.pipe(stream);

	const left = 40;
	const right = doc.page.width - 40;
	const contentWidth = right - left;

	// ==================== KOP SURAT ====================
	// Logo placeholder / icon box jika logo belum ada
	const logoWidth = 65;
	const logoHeight = 65;
	const topMargin = 36;

	doc.lineWidth(1).strokeColor("#000000");
	doc.rect(left, topMargin, logoWidth, logoHeight).stroke();
	
	doc.fontSize(7).font("Helvetica-Bold");
	doc.text("PERUMDA PALD\nBANJARMASIN", left, topMargin + 22, {
		width: logoWidth,
		align: "center",
	});

	// Header Text
	const headerLeft = left + logoWidth + 15;
	const headerWidth = right - headerLeft;

	doc.fontSize(12).font("Helvetica-Bold");
	doc.text("PEMERINTAH KOTA BANJARMASIN", headerLeft, topMargin - 2, {
		width: headerWidth,
		align: "center",
	});

	doc.fontSize(11).font("Helvetica-Bold");
	doc.text("PERUSAHAAN UMUM DAERAH", headerLeft, doc.y + 1, {
		width: headerWidth,
		align: "center",
	});

	doc.fontSize(11).font("Helvetica-Bold");
	doc.text("PENGELOLA AIR LIMBAH DOMESTIK BANJARMASIN", headerLeft, doc.y + 1, {
		width: headerWidth,
		align: "center",
	});

	doc.fontSize(12).font("Helvetica-Bold");
	doc.text("( PERUMDA PALD )", headerLeft, doc.y + 1, {
		width: headerWidth,
		align: "center",
	});

	doc.fontSize(8).font("Helvetica");
	doc.text(
		"Jl. Pasar Pagi No. 89 RT. 01 Telp. (0511) 3271940 Fax. (0511) 3252883 Banjarmasin 70241\nwebsite: www.perumdapaldbanjarmasin.com  e-mail : perumdapaldbanjarmasin@gmail.com",
		left,
		topMargin + logoHeight + 6,
		{
			width: contentWidth,
			align: "center",
		}
	);

	// Garis pembatas kop ganda
	const lineY1 = topMargin + logoHeight + 32;
	doc.lineWidth(1.5).moveTo(left, lineY1).lineTo(right, lineY1).stroke();
	doc.lineWidth(0.5).moveTo(left, lineY1 + 3).lineTo(right, lineY1 + 3).stroke();

	// ==================== JUDUL & NO ====================
	const titleY = lineY1 + 10;
	doc.fontSize(12).font("Helvetica-Bold");
	doc.text("FORMULIR ADUAN PELANGGAN", left, titleY);

	const nomorPengaduan = pengaduan.idPengaduan ? pengaduan.idPengaduan.slice(0, 8).toUpperCase() : "-";
	doc.fontSize(11).font("Helvetica-Bold");
	doc.text(`No.   ${nomorPengaduan}`, right - 180, titleY, {
		width: 180,
		align: "left",
	});

	// Garis tebal bawah judul
	const titleLineY = titleY + 16;
	doc.lineWidth(1.5).moveTo(left, titleLineY).lineTo(right, titleLineY).stroke();

	// ==================== PILIHAN SUMBER LAPORAN & TANGGAL/STATUS ====================
	const sectionY = titleLineY + 10;
	const checkboxSize = 14;
	const checkX = left + 140;

	// Saluran keluhan: WhatsApp, Telepon, Datang_Ketempat / Datang Langsung
	const saluran = pengaduan.saluranKeluhan || "";
	const isDatang = saluran === "Datang_Ketempat" || saluran === "Datang Ketempat";
	const isTelepon = saluran === "Telepon" || saluran === "WhatsApp";
	const isTemuan = false; // default form

	doc.fontSize(10).font("Helvetica");
	doc.text("1  Datang Langsung", left, sectionY);
	doc.rect(checkX, sectionY - 2, checkboxSize, checkboxSize).stroke();
	if (isDatang) {
		doc.fontSize(10).font("Helvetica-Bold").text("v", checkX + 3, sectionY - 1);
	}

	doc.fontSize(10).font("Helvetica");
	doc.text("2  Via Telepon", left, sectionY + 16);
	doc.rect(checkX, sectionY + 14, checkboxSize, checkboxSize).stroke();
	if (isTelepon) {
		doc.fontSize(10).font("Helvetica-Bold").text("v", checkX + 3, sectionY + 15);
	}

	doc.fontSize(10).font("Helvetica");
	doc.text("3  Temuan Lapangan", left, sectionY + 32);
	doc.rect(checkX, sectionY + 30, checkboxSize, checkboxSize).stroke();
	if (isTemuan) {
		doc.fontSize(10).font("Helvetica-Bold").text("v", checkX + 3, sectionY + 31);
	}

	// Tanggal Lapor & Status Pelanggan (Sisi Kanan)
	const rightColX = left + 300;
	const tanggalObj = pengaduan.tanggalDiterima ? new Date(pengaduan.tanggalDiterima) : new Date();
	const tglFormatted = `${String(tanggalObj.getDate()).padStart(2, "0")} / ${String(tanggalObj.getMonth() + 1).padStart(2, "0")} / ${tanggalObj.getFullYear()}`;

	doc.fontSize(10).font("Helvetica");
	doc.text("Tanggal Lapor", rightColX, sectionY);
	doc.text(`:   ${tglFormatted}`, rightColX + 90, sectionY);

	const isPelanggan = pengaduan.sumberAduan
		? pengaduan.sumberAduan === "Pelanggan"
		: Boolean(pengaduan.pelanggan?.noKontakPdam);

	doc.text("Status", rightColX, sectionY + 16);
	doc.font(isPelanggan ? "Helvetica-BoldOblique" : "Helvetica-Oblique");
	doc.text(`:   Pelanggan ${isPelanggan ? "[x]" : "[  ]"}`, rightColX + 90, sectionY + 16);

	doc.font(!isPelanggan ? "Helvetica-BoldOblique" : "Helvetica-Oblique");
	doc.text(`:   Non Pelanggan ${!isPelanggan ? "[x]" : "[  ]"}`, rightColX + 90, sectionY + 30);

	// ==================== FORM DATA PELAPOR ====================
	let formY = sectionY + 54;
	const labelX = left;
	const colonX = left + 145;
	const valueX = left + 160;
	const formLineWidth = right - valueX;

	const drawFormRow = (label, value) => {
		doc.fontSize(10).font("Helvetica");
		doc.text(label, labelX, formY);
		doc.text(":", colonX, formY);
		doc.text(value || "-", valueX, formY, { width: formLineWidth });

		// Garis bawah isian form
		doc.lineWidth(0.5).strokeColor("#777777");
		doc.moveTo(valueX, formY + 12).lineTo(right, formY + 12).stroke();
		doc.strokeColor("#000000");

		formY += 18;
	};

	const pel = pengaduan.pelanggan || {};

	drawFormRow("Nama Pelapor", pel.namaPelanggan);
	drawFormRow("Alamat", pel.alamat);
	drawFormRow("Nomor Telpon/HP", pel.noHp);

	// Kontrak PDAM & Atas Nama
	doc.fontSize(10).font("Helvetica");
	doc.text("Kontrak PDAM", labelX, formY);
	doc.text(":", colonX, formY);
	doc.text(`NO.  ${pel.noKontakPdam || "-"}`, valueX, formY);
	doc.moveTo(valueX + 25, formY + 12).lineTo(valueX + 160, formY + 12).stroke();

	const atasNamaX = valueX + 170;
	doc.text("Atas Nama :", atasNamaX, formY);
	doc.text(pel.namaPelanggan || "-", atasNamaX + 65, formY);
	doc.moveTo(atasNamaX + 65, formY + 12).lineTo(right, formY + 12).stroke();
	formY += 18;

	// Kontrak Perumda PALD & Atas Nama
	doc.text("Kontrak Perumda PALD", labelX, formY);
	doc.text(":", colonX, formY);
	doc.text("NO.  -", valueX, formY);
	doc.moveTo(valueX + 25, formY + 12).lineTo(valueX + 160, formY + 12).stroke();

	doc.text("Atas Nama :", atasNamaX, formY);
	doc.text("-", atasNamaX + 65, formY);
	doc.moveTo(atasNamaX + 65, formY + 12).lineTo(right, formY + 12).stroke();
	formY += 24;

	// ==================== KELUHAN & KETERANGAN TAMBAHAN ====================
	const boxTop = formY;
	const halfWidth = (contentWidth - 10) / 2;

	// Kotak Keluhan (Kiri)
	doc.rect(left, boxTop, halfWidth, 130).stroke();
	doc.fontSize(9).font("Helvetica-Bold");
	doc.text("Keluhan / Aduan:", left + 6, boxTop + 6);
	doc.fontSize(9).font("Helvetica");
	doc.text(pengaduan.keluhan || "-", left + 6, boxTop + 20, {
		width: halfWidth - 12,
		height: 100,
		ellipsis: true,
	});

	// Kotak Keterangan Tambahan (Kanan)
	const boxRightX = left + halfWidth + 10;
	doc.rect(boxRightX, boxTop, halfWidth, 130).stroke();
	doc.fontSize(9).font("Helvetica-Bold");
	doc.text("Keterangan Tambahan :", boxRightX + 6, boxTop + 6);
	doc.fontSize(9).font("Helvetica");
	const statusInfo = `Status: ${pengaduan.status || "-"}\nPetugas Penerima: ${pengaduan.penerima?.namaUser || "-"}\nPetugas Lapangan: ${pengaduan.penangani?.namaUser || "-"}`;
	doc.text(statusInfo, boxRightX + 6, boxTop + 20, {
		width: halfWidth - 12,
		height: 100,
	});

	// ==================== TANDA TANGAN & KETERANGAN ARSIP ====================
	const ttdY = boxTop + 145;

	// Keterangan tembusan arsip (Kiri Bawah)
	doc.fontSize(8).font("Helvetica-BoldOblique");
	doc.text("Keterangan :", left, ttdY);
	doc.font("Helvetica-Oblique");
	doc.text("1. Arsip", left, ttdY + 11);
	doc.text("2. Divisi Operasional dan Pemeliharaan", left, ttdY + 21);
	doc.text("3. Pemohon", left, ttdY + 31);

	// Pemohon (Tengah)
	const pemohonX = left + 190;
	doc.fontSize(10).font("Helvetica");
	doc.text("Pemohon", pemohonX, ttdY, { width: 140, align: "center" });

	const pemohonNama = pel.namaPelanggan ? `( ${pel.namaPelanggan} )` : "( ........................................ )";
	doc.text(pemohonNama, pemohonX - 10, ttdY + 60, { width: 160, align: "center" });

	// Penerima Aduan (Kanan)
	const penerimaX = right - 160;
	doc.text("Penerima Aduan", penerimaX, ttdY, { width: 160, align: "center" });

	const penerimaNama = pengaduan.penerima?.namaUser ? `( ${pengaduan.penerima.namaUser} )` : "( ........................................ )";
	doc.text(penerimaNama, penerimaX, ttdY + 60, { width: 160, align: "center" });

	// Selesaikan dokumen
	doc.end();
};
