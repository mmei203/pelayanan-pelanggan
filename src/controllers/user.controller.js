import { prisma } from "../config/db.js";

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
			orderBy: { createdAt: "desc" },
		});

		res.status(200).json({ success: true, data: users });
	} catch (error) {
		next(error);
	}
};

export const createUser = async (req, res, next) => {
	try {
		const { namaUser, email, username, password, role } = req.body;

		const newUser = await prisma.tabelUser.create({
			data: { namaUser, email, username, password, role },
			select: {
				idUser: true,
				namaUser: true,
				email: true,
				username: true,
				role: true,
				createdAt: true,
			},
		});

		res.status(201).json({
			success: true,
			message: "User berhasil dibuat",
			data: newUser,
		});
	} catch (error) {
		next(error);
	}
};

export const updateUser = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { namaUser, email, username, password, role } = req.body;

		const userExist = await prisma.tabelUser.findUnique({
			where: { idUser: id },
		});

		if (!userExist) {
			return res
				.status(404)
				.json({ success: false, message: "User tidak ditemukan" });
		}

		const updatedUser = await prisma.tabelUser.update({
			where: { idUser: id },
			data: {
				...(namaUser && { namaUser }),
				...(email && { email }),
				...(username && { username }),
				...(password && { password }),
				...(role && { role }),
			},
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
			message: "User berhasil diperbarui",
			data: updatedUser,
		});
	} catch (error) {
		next(error);
	}
};
