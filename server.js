import express from "express";
import 'dotenv/config'; // import variabel dari .env
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';

const server = express();
const PORT = process.env.PORT;

// MIDDLEWARES
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
// server.use(errorMiddleware);
server.use(cors());
server.use(morgan('dev'));
server.use(helmet());

const limiter = rateLimit({
   windowMs: 5 * 60 * 1000, //timeout sampe kapan
   limit: 20,
   message: "TOO MANY REQUEST"
})
server.use(limiter);


// ROUTES

server.get('/', (req, res) => {
   res.json({message: 'API PELAYANAN PERUMDA'});
});

server.listen(PORT, () => {
   console.log(`server is running in http://localhost:${PORT}`);
})