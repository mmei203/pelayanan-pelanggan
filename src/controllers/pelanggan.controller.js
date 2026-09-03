import {prisma} from '../config/db.js';

// GET ALL PELANGGAN
export const getPelanggan = async (req, res, next) => {
   try {
      const pelanggan = await prisma.pelanggan.findMany();
      return res.status(200).json({
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
      const {namaPelanggan, alamat, noPdam, keluhan, noTelp} = req.body;
      const createPelanggan = await prisma.pelanggan.create({
         data: {
            namaPelanggan,
            alamat,
            noPdam,
            keluhan,
            noTelp,
         }
      });
      return res.status(201).json({
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

// GET DETAIL PELANGGAN
export const detailPelanggan = async (req, res, next) => {
   try {
      const {id} = req.params
      const pelanggan = await prisma.pelanggan.findUnique({
         where: {id}
      });

      if (!pelanggan) {
         res.status(404).json({
            success: false,
            message: 'data tidak ditemukan'
         })
      }

      return res.status(200).json({
         success: true,
         message: 'data berhasil muncul',
         data: {
            pelanggan
         }
      })
   } catch (error) {
      next(error)
   }
}

export const updatePelanggan = async (req, res, next) => {
   try {
      const {id} = req.params;
      const {namaPelanggan, noPdam, noTelp, alamat, keluhan} = req.body;
      const pelanggan = await prisma.pelanggan.update({
         where: {id},
         data: {
            namaPelanggan,
            noPdam,
            noTelp,
            alamat,
            keluhan
         }
      });
      return res.status(201).json({
         success: true,
         message: 'berhasil update pelanggan',
         data: {
            pelanggan
         }
      })
   } catch (error) {
      next(error);
   }
}

// GET PELANGGAN BY STATUS
export const pelangganByStatus = async (req, res, next) => {
   try {
      const {statusPelanggan} = req.params;
      const {namaPelanggan, alamat, noPdam, keluhan, noTelp} = req.body;
      const pelanggan = await prisma.pelanggan.findMany({
         where: {statusPelanggan},
         data: {
            namaPelanggan,
            alamat,
            noPdam,
            noTelp,
            keluhan
         }
      });
      return res.status(200).json({
         success: true,
         message: `Berhasil ambil data by status : ${statusPelanggan}`,
         data: {
            pelanggan
         }
      })
   } catch (error) {
      next(error)
   }
}