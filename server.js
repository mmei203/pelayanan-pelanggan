import express from "express";
import 'dotenv/config'; // import variabel dari .env
import pelangganRoute from "./src/routes/pelanggan.routes.js";

const server = express();
const PORT = process.env.PORT;

server.use('/pelanggan', pelangganRoute);

server.get('/', (req, res) => {
   res.json({message: 'API PELAYANAN PERUMDA'});
});

server.listen(PORT, () => {
   console.log(`server is running in http://localhost:${PORT}`);
})