import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import marketDataRoutes from "./routes/marketDataRoutes.js";
import priceCacheRoutes from "./routes/priceCacheRoutes.js";
import newsCacheRoutes from "./routes/newsCacheRoutes.js";
import { startPriceUpdater, insertEODData } from "./processes/priceUpdater.js";
import {startNewsCleanup} from "./processes/newsCacheCleanup.js";
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173",
      "https://quorixx.netlify.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(authRoutes);
app.use(marketDataRoutes);
app.use(priceCacheRoutes);
app.use(newsCacheRoutes);
app.listen(4000, () => {
  console.log("auth server running on quorix-production.up.railway.app");
  insertEODData();
});

//startPriceUpdater();
startNewsCleanup();
