import express from "express";
import 'dotenv/config'; // import variabel dari .env
import pelangganRoute from "./src/routes/pelanggan.routes.js";
import historyRoute from "./src/routes/history.routes.js";
import authRoute from './src/routes/auth.routes.js';

const server = express();
const PORT = process.env.PORT;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use('/pelanggan', pelangganRoute);
server.use('/history', historyRoute);
server.use('/auth', authRoute);

server.get('/', (req, res) => {
   res.json({message: 'API PELAYANAN PERUMDA'});
});

server.listen(PORT, () => {
   console.log(`server is running in http://localhost:${PORT}`);
})