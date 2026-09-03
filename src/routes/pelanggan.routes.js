import {Router} from 'express';
import { 
   detailPelanggan, 
   getPelanggan, 
   postPelanggan, 
   updatePelanggan 
} from '../controllers/pelanggan.controller.js';

const pelangganRoute =  Router();

// GET ALL PELANGGAN
pelangganRoute.get('/',getPelanggan);

// GET PELANGGAN BY NAME
pelangganRoute.get('/:id',detailPelanggan);

// ADD PELANGGAN
pelangganRoute.post('/tambah-pelanggan', postPelanggan);

// EDIT PELANGGAN
pelangganRoute.put('/:id', updatePelanggan);

export default pelangganRoute;