export const errorHandler = (err, req, res, next) => {
	console.error(err.stack);
	const status = err.statusCode || 500;
	const message = err.message || "Terjadi kesalahan internal server";

	res.status(status).json({
		success: false,
		message,
	});
};
