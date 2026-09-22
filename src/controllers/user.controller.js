import { prisma } from "../config/db.js";

// GET All Users
export const getAllUsers = async (req, res, next) => {
	try {
		const users = await prisma.tabelUser.findMany({
			select: {
				idUser: true,
				namaUser: true,
				email: true,
				username: true,
				role: true,
				createdAt: true,
			},
		});

		res.status(200).json({
			success: true,
			data: users,
		});
	} catch (error) {
		next(error);
	}
};

// POST Create User Baru (CS / Operator / Pengawas)
export const createUser = async (req, res, next) => {
	try {
		const { namaUser, email, username, password, role } = req.body;

		const userBaru = await prisma.tabelUser.create({
			data: {
				namaUser,
				email,
				username,
				password, // Disarankan hashing password (e.g. bcrypt) jika diperlukan
				role,
			},
		});

		res.status(201).json({
			success: true,
			message: "User berhasil dibuat",
			data: userBaru,
		});
	} catch (error) {
		next(error);
	}
};
