// ==================== Module Imports & Dependencies ====================

import { get, Server as httpServer } from "node:http";
import { Server } from "socket.io";
import { decodedToken, tokenTypeEnum } from "../../Utils/security/token";
import { IAuthSocket } from "./gateway.dto";
import { ChatGateway } from "../chat/chat.gateway";


// ==================== Global Socket.IO Instance & Connected Sockets Map ====================

let io: Server | null = null;
const connectedSockets = new Map<string, string[]>();


// ==================== Socket.IO Server Initialization Function ====================

export const initialize = (httpServer: Server) => {


    // ==================== Create & Configure Socket.IO Server ====================

    io = new Server(httpServer, {
        cors: {
            origin: "*", // Allow all origins for testing purposes (adjust in production) or ["http://localhost:3000"] for specific origin
        },
    });


    // ==================== Global Authentication Middleware for All Connections ====================

    io.use(async (socket: IAuthSocket, next) => {
        try {
            const { user, decoded } = await decodedToken({
                authorization: socket.handshake.auth.authorization,
                tokenType: tokenTypeEnum.ACCESS,
            });

            const userTabs = connectedSockets.get(user._id.toString()) || [];
            userTabs.push(socket.id);
            connectedSockets.set(user._id.toString(), userTabs);

            socket.credentials = { user, decoded };
            next();
        } catch (error:any) {
            next(new Error("Authentication Error"));
        }
    });


    // ==================== Handle Socket Disconnection & Multi-Tab Cleanup ====================

    function disconnection (socket: IAuthSocket) {
        socket.on("disconnect", () => {
            const userId = socket.credentials?.user._id?.toString() as string;
            const remainingTabs = connectedSockets.get(userId)?.filter((tab)=> {
                return tab !== socket.id;
            }) || [];
            if(remainingTabs.length > 0){
                connectedSockets.set(userId, remainingTabs);
            } else {
                connectedSockets.delete(userId);
            }
            console.log(`After Delete:::${connectedSockets.get(userId)}`);
            console.log(connectedSockets);
        });
    }


    // ==================== Connection Event – Register Chat Events & Handle Disconnect ====================

    const chatGateway:ChatGateway = new ChatGateway();

    io.on("connection", (socket:IAuthSocket) => {
        chatGateway.register(socket, getIo());
        disconnection(socket);

        //console.log(socket.credentials?.user._id?.toString() as string );
        
        connectedSockets.delete(socket.credentials?.user._id?.toString() as string);
    });

};


// ==================== Getter for Initialized Socket.IO Instance ====================

export const getIo = () : Server =>{
    if(!io) {throw new Error("Socket.IO not initialized");}
    return io;
} 