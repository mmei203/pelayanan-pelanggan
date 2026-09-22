import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./src/config/env.js";
import pelangganRoutes from "./src/routes/pelanggan.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder Static untuk Akses File Upload (Dokumen / Foto)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api", pelangganRoutes);
app.use("/api", userRoutes);

// Root Route
app.get("/", (req, res) => {
	res.json({ message: "API PERUMDA PALD Running Successfully" });
});

// Global Error Handler
app.use(errorHandler);

app.listen(config.port, () => {
	console.log(`Server is running on port ${config.port}`);
});
