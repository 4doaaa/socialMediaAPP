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
import postRouter from "./Modules/post/post.controller";
import commentRouter from "./Modules/post/post.controller";
import chatRouter from "./Modules/chat/chat.controller";
import { BadRequestException, globalErrorHandler } from "./Utils/response/error.response";
import connectDB from "./DB/connection";
import { promisify } from "node:util";
import { createGetPresignedURL, deleteFile, deleteFiles, getFile } from "./Utils/multer/s3.config";
import { pipeline } from "node:stream";
import { initialize } from "./Modules/geteway/gateway";
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
    const port: number = Number(process.env.PORT) || 3000;

    // ==================== Global Middlewares ====================
    app.use(cors(), express.json(), helmet());
    app.use(limiter);
    await connectDB();

    // ==================== Get Pre-signed URL for S3 Uploads ====================
    app.get("/uploads/pre-signed/*path", async (req:Request, res:Response) => {
        const {path: filePath} = req.params as unknown as {path: string []};
        const Key = filePath.join("/")
        const url = await createGetPresignedURL({
            Key,
        });
        return res.status(200).json({message:"Done", url});
    });

    // ==================== Serve / Download File from S3 ====================
    app.get("/uploads/*path", async (req:Request, res:Response) => {
        const {downloadName} = req.query;
        const {path: filePath} = req.params as unknown as {path: string []};
        const Key = filePath.join("/")
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
    app.delete("/test", async (_req:Request, res:Response) => {
        const results = await deleteFiles({
            urls: [
                "SOCIAL_MEDIA_APP/users/undefined/da8297a2-211e-4aa8-9705-b2d666b0cfb0-toleen1.jpeg",
                "SOCIAL_MEDIA_APP/users/undefined/cover/b3be0f0a-72cf-4194-bf74-da983782db32-6044152934607556141 (3).jpg"
            ],
        });
        return res.status(200).json({message:"Files Deleted", results});
    });

    // ==================== Root Route (Welcome Message) ====================
    app.get("/", (_req: Request, res: Response) => {
        res.status(200).json({ message: "Welcome To Social Media App" });
    });

    // ==================== API Routes Mounting ====================
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/post", postRouter);
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/comment", commentRouter);
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/chat", chatRouter);

    // ==================== Catch-All 404 Not Found Handler ====================
    app.use("{/*dummy}", (_req: Request, res: Response) => {
        res.status(404).json({ message: "Not Found Handler" });
    });

//     async function user() { 

// try {
//     const user = new UserModel({
//         username:"test test",
//         email:`${Date.now()}@gmail.com`,
//         password: "doaa@2005",
//     });
//  await user.save();
//  user.lastName = "monem";

// async function testUserModel() { 
//     try {
//   const userRepository = new UserRepository(UserModel);
//   const user = await userRepository.findOneAndUpdate({


//     filter:{_id: "69836231796279fae7a1c193"},
//     update: {freezedAt:new Date()}
// });
//  const user = await userRepository.findOneAndDelete({
//     filter:{_id: "698361ca59443e8d8657c72b"},
// });


// const user = await UserModel.insertMany({
//     data:[
//     {username:"Doaa Monem", email:`${Date.now()}@gmail.com`, password: "doaa@2005"},
//     {username:"Doaa Monem", email:`${Date.now()}asal@gmail.com`, password: "asal@2005"}
// ]})
// console.log({results: user});

//     } catch (error) {
//         console.log("Error in testUserModel:", error);
//     }
// }
// testUserModel();

    // ==================== Global Error Handler ====================
    
    
    app.use(globalErrorHandler);


    const httpServer = app.listen(port, () => {
        console.log(`Server is Running On http://localhost:${port}`);
    });

initialize(httpServer);

    // ==================== Start Express Server ====================
   
   
    
//         console.log("Classic Connection",socket.id);
// let connectedSockets: string[] = [];
// connectedSockets.push(socket.id);

// io.to(connectedSockets[connectedSockets.length - 3] as string).emit("product", { id: 1, title: "Apple Laptop", price: 3000000}, (res) =>{
//     console.log({ res });
    
// },
// );

// io.except(connectedSockets[connectedSockets.length - 3] as string).emit(
//     "product", { id: 1, title: "Apple Laptop", price: 3000000}, (res) =>{
//     console.log({ res });
// },//هبعت لكل الناس ماعدا البني ادم ده 
// );



//         socket.on("sayHi", (data, callback) => {
//     console.log({data});
//     callback("Hello From BE to i received All data");
// });

//         socket.emit("product", { id: 1, title: "Apple Laptop", price: 3000000});
      

// socket.emit("product", { id: 1, title: "Apple Laptop", price: 3000000}, (res) =>{
//     console.log({res});
// });

// socket.broadcast.emit("product", { id: 1, title: "Apple Laptop", price: 3000000}, (res) =>{
//     console.log({res});
// });

// io.emit("product", { id: 1, title: "Apple Laptop", price: 3000000}, (res) =>{//ببعت لكل العملاء المتصلين 
//     console.log({res});
// });



    // http://localhost:3000/admin/
// io.of("/admin").on("connection", (socket) => {
//     console.log("Admin Connected",socket.id);
// });
 };

 export default bootstrap;