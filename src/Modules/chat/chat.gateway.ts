// ==================== Module Imports & Dependencies ====================

import { Server } from "socket.io";
import { IAuthSocket } from "../geteway/gateway.dto";
import { ChatEvents } from "./chat.events";

export class ChatGateway {
    private _chatEvent = new ChatEvents();
    
    constructor() {}


    // ==================== Register All Chat Socket Event Listeners ====================

    register = (socket: IAuthSocket, io:Server) => {

        this._chatEvent.sayHi(socket, io);
        this._chatEvent.sendMessage(socket, io);
        this._chatEvent.joinRoom(socket, io);

    };


}