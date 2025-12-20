import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { config } from "dotenv";
import authRouter from "./Modules/Auth/auth.controller";
import userRouter from "./Modules/User/user.controller";
import { globalErrorHandler } from "./Utils/response/error.response";
import connectDB from "./DB/connection";

// ==================== Load Environment Variables ====================

config({ path: path.resolve("./config/.env.dev") });

// ==================== Rate Limiting Configuration ====================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: {
        status: 429,
        message: "Too Many Requests, Please Try again Later"
    }
});

// ==================== Bootstrap Function (Application Initialization) ====================

export const bootstrap = async () => {
    const app: Express = express();
    const port: number = Number(process.env.PORT) || 5000;

    // ==================== Global Middlewares ====================

    app.use(cors(), express.json(), helmet());
    app.use(limiter);
    await connectDB();

    // ==================== Routes ====================

    app.get("/", (req: Request, res: Response) => {
        res.status(200).json({ message: "Welcome To Social Media App" });
    });

    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/user", userRouter);

    // ==================== 404 Not Found Handler ====================

    app.use("{/*dummy}", (req: Request, res: Response) => {
        res.status(404).json({ message: "Not Found Handler" });
    });

    // ==================== Global Error Handler ====================

    app.use(globalErrorHandler);

    // ==================== Start Server ====================

    app.listen(port, () => {
        console.log(`Server is Running On http://localhost:${port}`);
    });
};