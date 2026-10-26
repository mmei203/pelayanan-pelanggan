import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./src/routes/user.routes.js";
import pelangganRoutes from "./src/routes/pelanggan.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder agar file/gambar dapat diakses langsung oleh browser
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static documentation
app.use("/docs", express.static(path.join(__dirname, "docs")));

// API Routes
app.use("/api", userRoutes);
app.use("/api", pelangganRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal Server Error",
	});
});

export default app;
