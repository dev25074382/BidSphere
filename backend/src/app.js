import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import bidRouter from "./routes/bid.route.js";
import auctionRouter from "./routes/auction.route.js";
import commissionRouter from "./routes/commission.route.js";
import adminRouter from "./routes/admin.route.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auction", auctionRouter);
app.use("/api/v1/bid", bidRouter);
app.use('/api/v1/commission',commissionRouter);
app.use("/api/v1/admin",adminRouter)


app.use(errorMiddleware);
export { app };
