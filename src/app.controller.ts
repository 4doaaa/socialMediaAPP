// ==================== Import Statements & Dependencies ====================
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { config } from "dotenv";
import authRouter from "./Modules/Auth/auth.controller";
import userRouter from "./Modules/User/user.controller";
import { BadRequestException, globalErrorHandler } from "./Utils/response/error.response";
import connectDB from "./DB/connection";
import { promisify } from "node:util";
import { createGetPresignedURL, deleteFile, deleteFiles, getFile } from "./Utils/multer/s3.config";
import { pipeline } from "node:stream";

// ==================== S3 Stream Pipeline Promisification ====================
const createS3WriteStreamPipe = promisify(pipeline);

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

    // ==================== Get Pre-signed URL for S3 Uploads ====================
    app.get("/uploads/pre-signed/*path", async (req:Request, res:Response) => {
        const {path} = req.params as unknown as {path: string []};
        const Key = path.join("/");
        const url = await createGetPresignedURL({
            Key,
        });
        return res.status(200).json({message:"Done", url});
    });

    // ==================== Serve / Download File from S3 ====================
    app.get("/uploads/*path", async (req:Request, res:Response) => {
        const {downloadName} = req.query;
        const {path} = req.params as unknown as {path: string []};
        const Key = path.join("/")
        const s3Response = await getFile({Key});

        if(!s3Response.Body){ 
            throw new BadRequestException("File To Fetch Asset");
        }

        res.setHeader("Content-Type", s3Response.ContentType || "application/octet-stream");

        if (downloadName) {
            res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
        }

        return await createS3WriteStreamPipe(
            s3Response.Body as ReadableStream,
            res);
    });

    // ==================== Delete Single File from S3 (Test Endpoint) ====================
    app.delete("/test-s3", async (req:Request, res:Response) => {
        const {Key} = req.query as {Key: string};
        const results = await deleteFile({Key: Key as string});
        return res.status(200).json({message:"File Deleted", results});
    });

    // ==================== Delete Multiple Files from S3 (Test Endpoint) ====================
    app.delete("/test", async (req:Request, res:Response) => {
        const results = await deleteFiles({
            urls: [
                "SOCIAL_MEDIA_APP/users/undefined/da8297a2-211e-4aa8-9705-b2d666b0cfb0-toleen1.jpeg",
                "SOCIAL_MEDIA_APP/users/undefined/cover/b3be0f0a-72cf-4194-bf74-da983782db32-6044152934607556141 (3).jpg"
            ],
        });
        return res.status(200).json({message:"Files Deleted", results});
    });

    // ==================== Root Route (Welcome Message) ====================
    app.get("/", (req: Request, res: Response) => {
        res.status(200).json({ message: "Welcome To Social Media App" });
    });

    // ==================== API Routes Mounting ====================
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/user", userRouter);

    // ==================== Catch-All 404 Not Found Handler ====================
    app.use("{/*dummy}", (req: Request, res: Response) => {
        res.status(404).json({ message: "Not Found Handler" });
    });

    // ==================== Global Error Handler ====================
    app.use(globalErrorHandler);

    // ==================== Start Express Server ====================
    app.listen(port, () => {
        console.log(`Server is Running On http://localhost:${port}`);
    });
};