import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import marketDataRoutes from "./routes/marketDataRoutes.js";
import cacheRoutes from "./routes/cacheRoutes.js";
import { startPriceUpdater, insertEODData } from "./processes/priceUpdater.js";
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(authRoutes);
app.use(marketDataRoutes);
app.use(cacheRoutes);
app.listen(4000, () => {
  console.log("auth server running on http://localhost:4000");
  //insertEODData();
});

//startPriceUpdater();
