import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			`${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
		);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
	const ext = path.extname(file.originalname).toLowerCase();

	if (allowedExtensions.includes(ext)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				"Format file tidak didukung! Format yang diizinkan: JPG, PNG, PDF, DOC.",
			),
			false,
		);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 }, // Limit 10MB
});
