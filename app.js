import express from "express";
import {config} from 'dotenv';
import {connectDB, disconnectDB} from './src/config/db.js';

config();
connectDB();

const app = express();

// json body parsing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// PORT
const PORT = 3000;
app.listen(PORT, () => {
   console.log(`server running on http://localhost:${PORT}`);
});


// HANDLING EVENTS
// handle unhandled promise rejection
process.on("unhandledRejection", (err) => {
   console.error("unhandled rejection:",err);
   server.close(async () => {
      await disconnectDB();
      process.exit(1);
   });
});

// handle uncaught exceptions
process.on("uncaughtException", async(err) => {
   console.error("uncaught exception:", err);
   await disconnectDB();
   process.exit(1);
});

// graceful(?) shitdown
process.on('SIGTERM', async() => {
   console.log("SIGTERM received, will shutdown not-gracefully :)");
   server.close(async() => {
      await disconnectDB();
      process.exit(0);
   }); 
});