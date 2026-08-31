import {Router} from 'express';

const pelangganRoute =  Router();

pelangganRoute.get('/',(req, res) =>  res.json({message: 'DAFTAR PELANGGAN'}));
pelangganRoute.get('/:id',(req, res) =>  res.json({message: 'DETAIL PELANGGAN'}));
pelangganRoute.post('/',(req, res) =>  res.json({message: 'TAMBAH PELANGGAN'}));
pelangganRoute.put('/:id',(req, res) =>  res.json({message: 'EDIT PELANGGAN'}));

export default pelangganRoute;