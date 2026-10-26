import { prisma } from "../src/config/db.js";

async function main() {
	console.log("Seeding data user...");

	// 1. Buat User CS
	const cs = await prisma.tabelUser.upsert({
		where: { username: "admin_cs" },
		update: {},
		create: {
			namaUser: "Admin Customer Service",
			email: "cs@pald.co.id",
			username: "admin_cs",
			password: "password123",
			role: "CS",
		},
	});

	// 2. Buat User Operator (3 Orang)
	const op1 = await prisma.tabelUser.upsert({
		where: { username: "operator1" },
		update: {},
		create: {
			namaUser: "Operator Lapangan 1",
			email: "op1@pald.co.id",
			username: "operator1",
			password: "password123",
			role: "Operator",
		},
	});

	await prisma.tabelUser.upsert({
		where: { username: "operator2" },
		update: {},
		create: {
			namaUser: "Operator Lapangan 2",
			email: "op2@pald.co.id",
			username: "operator2",
			password: "password123",
			role: "Operator",
		},
	});

	// 3. Buat User Pengawas
	await prisma.tabelUser.upsert({
		where: { username: "pengawas1" },
		update: {},
		create: {
			namaUser: "Pengawas Utama",
			email: "pengawas@pald.co.id",
			username: "pengawas1",
			password: "password123",
			role: "Pengawas",
		},
	});

	console.log("Seeding selesai!");
	console.log(`Gunakan ID CS ini untuk testing POST /pelanggan: ${cs.idUser}`);
	console.log(
		`Gunakan ID Operator ini untuk testing PUT /pelanggan: ${op1.idUser}`,
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
