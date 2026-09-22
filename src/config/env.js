import "dotenv/config";

export const config = {
	port: process.env.PORT || 3000,
	dbHost: process.env.DB_HOST,
	dbUser: process.env.DB_USERNAME,
	dbPass: process.env.DB_PASSWORD,
	dbName: process.env.DB_DATABASE,
	dbPort: process.env.DB_PORT,
};
