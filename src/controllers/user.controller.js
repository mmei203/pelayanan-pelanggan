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
