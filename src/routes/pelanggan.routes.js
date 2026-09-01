import {Router} from 'express';

const pelangganRoute =  Router();

// GET ALL PELANGGAN
pelangganRoute.get('/',(req, res) =>  res.json({message: "DAFTAR PELANGGAN"}));

// GET PELANGGAN BY ID
pelangganRoute.get('/:id',(req, res) =>  res.json({message: "DETAIL PELANGGAN"}));

// ADD PELANGGAN
pelangganRoute.post('/',(req, res) =>  res.json({message: "TAMBAH PELANGGAN"}));

// EDIT PELANGGAN
pelangganRoute.put('/:id',(req, res) =>  res.json({message: 'EDIT PELANGGAN'}));

export default pelangganRoute;