// ==================== Module Imports & Dependencies ====================

import { Server } from "socket.io";
import { IAuthSocket } from "../geteway/gateway.dto";
import { ChatService } from "./chat.service";


// ==================== ChatEvents Class Declaration ====================

export class ChatEvents {


    // ==================== Private ChatService Instance ====================

    private _chatService = new ChatService();
    constructor() {}


    // ==================== Socket Event – Say Hi (Test / Ping) ====================

    sayHi = (socket: IAuthSocket , io:Server) => {
        return socket.on("sayHi",(message,callback) => { 
             this._chatService.sayHi({message, socket, callback, io});
            });
      
    
    };


    // ==================== Socket Event – Send Private Message ====================

    sendMessage = (socket: IAuthSocket, io:Server) => {
        return socket.on("send_message",
            (data: { content:string ; sendTo:string })=>{
                this._chatService.sendMessage({...data, socket, io})
            },
        );
    }


    // ==================== Socket Event – Join Group Room ====================

     joinRoom = (socket: IAuthSocket, io:Server) => {
        return socket.on("join_room",
            (data: { roomId:string })=>{
                this._chatService.joinRoom({...data, socket, io})
            },
        );
    }


    // ==================== Socket Event – Send Message to Group ====================

       sendGroupMessage = (socket: IAuthSocket, io:Server) => {
        return socket.on("sendGroupMessage",
            (data: { content:string ; groupId:string })=>{
                this._chatService.sendGroupMessage({...data, socket, io})
            },
        );
    }


}