import {Router} from 'express';
import { detailPelanggan, getPelanggan, postPelanggan } from '../controllers/pelanggan.controller.js';

const pelangganRoute =  Router();

// GET ALL PELANGGAN
pelangganRoute.get('/',getPelanggan);

// GET PELANGGAN BY NAME
pelangganRoute.get('/:id',detailPelanggan);

// ADD PELANGGAN
pelangganRoute.post('/tambah-pelanggan', postPelanggan);

// EDIT PELANGGAN
pelangganRoute.put('/:id',(req, res) =>  res.json({message: 'EDIT PELANGGAN'}));

export default pelangganRoute;