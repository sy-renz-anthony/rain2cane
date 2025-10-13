import express from 'express';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import cors from 'cors';
import cookieParser from "cookie-parser";

import { dbConnection } from './config/db.js';
import regionsRouter from './routers/region.router.js';
import provinceRouter from './routers/province.router.js';
import municipalityRouter from './routers/municipality.router.js';
import barangayRouter from './routers/barangay.router.js';
import userRouter from './routers/user.router.js';
import deviceRouter from './routers/device.router.js';

const secretPath =
  fs.existsSync('/etc/secrets/.env')
    ? '/etc/secrets/.env'
    : './.env';

dotenvConfig({ path: secretPath });

const app=express();

const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === "null")
      return callback(null, false);

    return callback(null, origin);
  },
  credentials: true
}));

app.get("/", (req, res)=>{
    res.json({message: "Server is working!"})
});
app.use("/api/region", regionsRouter);
app.use("/api/province", provinceRouter);
app.use("/api/municipality", municipalityRouter);
app.use("/api/barangay", barangayRouter);
app.use("/api/user", userRouter);
app.use("/api/device", deviceRouter);

app.listen(PORT, ()=>{
    dbConnection();
    console.log("server started at http://localhost:"+PORT);
});