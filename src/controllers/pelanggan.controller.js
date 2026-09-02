import {prisma} from '../config/db.js';

// GET ALL PELANGGAN
export const getPelanggan = async (req, res, next) => {
   try {
      const pelanggan = await prisma.pelanggan.findMany();
      res.status(200).json({
         success: true,
         message: 'data berhasil diambil',
         data: {
            pelanggan
         }
      })
   } catch (error) {
      next(error)
   }
}

// CREATE PELANGGAN
export const postPelanggan = async (req, res, next) => {
   try {
      const {namaPelanggan, alamat, noPdam, keluhan, noTelp, statusPelanggan} = req.body;
      const createPelanggan = await prisma.pelanggan.create({
         data: {
            namaPelanggan,
            alamat,
            noPdam,
            keluhan,
            noTelp,
            statusPelanggan,
         }
      });
      res.status(201).json({
         success: true,
         message: 'berhasil menambahkan pelanggan',
         data: {
            createPelanggan
         }
      })
   } catch (error) {
      next(error)
   }
}