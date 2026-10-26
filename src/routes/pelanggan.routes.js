import { Router } from "express";
import {
	getAllPelanggan,
	getPelangganByStatus,
	getPelangganById,
	createPelanggan,
	updatePelanggan,
	getHistory,
} from "../controllers/pelanggan.controllers.js";
import { uploadMiddleware } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/pelanggan", getAllPelanggan);
router.get("/pelanggan/filter", getPelangganByStatus);
router.get("/pelanggan/history", getHistory);
router.get("/pelanggan/:id", getPelangganById);
router.post("/pelanggan", createPelanggan);

router.put(
	"/pelanggan/:id",
	uploadMiddleware.fields([
		{ name: "dokumenLaporan", maxCount: 1 },
		{ name: "fotoKeluhan", maxCount: 1 },
	]),
	updatePelanggan,
);

export default router;
