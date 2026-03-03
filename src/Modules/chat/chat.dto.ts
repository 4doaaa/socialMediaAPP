// ==================== Module Imports & Dependencies ====================

import { Server } from "socket.io";
import { IAuthSocket } from "../geteway/gateway.dto";
import { createGroupChatSchema, getChatSchema, getGroupChatSchema } from "./chat.validation";
import z from "zod";


// ==================== DTO Interface – Say Hi (Test / Ping Message) ====================

export interface ISayHiDTO {
    message:string;
    socket: IAuthSocket;
    callback: any;
    io:Server;
}


// ==================== DTO Interface – Send Private Message ====================

export interface ISendMessageDTO {
    content:string;
    sendTo:string;
    socket: IAuthSocket;
    io:Server;
}


// ==================== DTO Interface – Join Group Chat Room ====================

export interface IJoinRoomDTO {
    roomId:string;
    socket: IAuthSocket;
    io:Server;
}


// ==================== DTO Interface – Send Message to Group ====================

export interface ISendGroupMessageDTO {
    content:string;
    groupId:string;
    socket: IAuthSocket;
    io:Server;
}


// ==================== Type Inference – Get Private Chat Params (from Zod) ====================

export type IGetChatDTO = z.infer<typeof getChatSchema.params>;


// ==================== Type Inference – Get Group Chat Params (from Zod) ====================

export type IGetGroupChatDTO = z.infer<typeof getGroupChatSchema.params>;


// ==================== Type Inference – Create Group Chat Body (from Zod) ====================

export type ICreateGroupChatDTO = z.infer<typeof createGroupChatSchema.body>;