import {prisma} from '../config/db.js';

// GET ALL HISTORY
export const getHistory = async (req, res) => {
   try {
      const history = await prisma.history.findMany({
         include: {
            pelanggan: true,
         },
         orderBy: {
            createdAt: 'desc'
         }
      });
      return res.status(200).json({
         success: true,
         message: "berhasil ambil history",
         data: {
            history
         }
      })
   } catch (error) {
      next(error)
   }
}