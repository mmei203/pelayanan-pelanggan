import multer from "multer";
import path from "path";
import fs from "fs";

// Buat folder uploads jika belum ada
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
	},
});

export const uploadMiddleware = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // Batas maksimal file 10MB
});
