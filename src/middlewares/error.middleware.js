import {prisma} from '../config/db.js';

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  console.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        message = `Nilai duplikat pada field: ${err.meta?.target || 'tertentu'}`;
        statusCode = 400;
        break;
      case 'P2025':
        message = 'Data pelanggan tidak ditemukan';
        statusCode = 404;
        break;
      default:
        message = `Database Error (${err.code})`;
        statusCode = 400;
        break;
    }
  }

  // Menangkap input Enum atau Tipe Data yang tidak sesuai Schema Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    message = 'Format atau tipe data input tidak valid (periksa statusPelanggan / noPdam)';
    statusCode = 400;
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorMiddleware; 