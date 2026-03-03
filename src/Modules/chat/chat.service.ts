// ==================== Module Imports & Dependencies ====================

import { Types } from "mongoose";
import { ChatModel } from "../../DB/models/chat.model";
import { UserModel } from "../../DB/models/user.model";
import { ChatRepository } from "../../DB/repository/chat.repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { ICreateGroupChatDTO, IGetChatDTO, IGetGroupChatDTO, IJoinRoomDTO, ISayHiDTO, ISendGroupMessageDTO, ISendMessageDTO } from "./chat.dto"
import { BadRequestException, NotFoundException } from "../../Utils/response/error.response";
import { v4 as uuid} from "uuid";
import { NextFunction, Request, Response } from "express";


// ==================== ChatService Class Declaration ====================

export class ChatService {


    // ==================== Private Repository Instances ====================

    private _chatModel = new ChatRepository(ChatModel);
    private _userModel = new UserRepository(UserModel);


    // ==================== Constructor & Method Binding ====================

    constructor() {
        this.getChat = this.getChat.bind(this);
    }


    // ==================== Placeholder / Not Implemented Method ====================

    static getChat(arg0: string, arg1: (req: Request, _res: Response, next: NextFunction) => Promise<void>, arg2: (req: Request, _res: Response, next: NextFunction) => void, getChat: any) {
        throw new Error('Method not implemented.');
    }


    // ==================== Get Private Chat Between Two Users ====================

    getChat = async(req:Request, res:Response) => {

        const { userId } = req.params as IGetChatDTO

        const chat = await this._chatModel.find({
          filter: { participants: {
            $all: [req.user?._id as Types.ObjectId,
               Types.ObjectId.createFromHexString(userId),
              ],
          },
          group: {$exists: false},
        },
        options: { populate: "participants", },
        });
        if(!chat) 
            throw new NotFoundException("Fail to Find Chat");
        return res.status(200).json({message:"Done!",data: {chat}});
    };


    // ==================== Get Group Chat by Group ID ====================

    getGroupChat = async(req:Request, res:Response) => {
        const { groupId } = req.params as IGetGroupChatDTO

        const chat = await this._chatModel.findOne({
            filter: {
            _id: Types.ObjectId.createFromHexString(groupId),
            group: {$exists: true},
            participants: {$in: [req.user?._id as Types.ObjectId]},
            },
            options: { populate: "messages.createdBy",
    
             },
        });
        if(!chat)
            throw new BadRequestException("Fail to Find Group Chat");

        return res.status(200).json({message:"Done!",data: {chat}});
    };


    // ==================== Create New Group Chat ====================

    createGroupChat = async(req:Request, res:Response) => {

        const { participants, group } = req.body as ICreateGroupChatDTO
    const dbParticipants = participants.map((participant) =>{
      return Types.ObjectId.createFromHexString(participant)
    });
      const users = await this._userModel.find({
        filter: {
            _id: {$in: dbParticipants},
            friends: {$in: [req.user?._id as Types.ObjectId]},
        
        },
      });
      if(dbParticipants.length !== users.length) {
        throw new BadRequestException("Invalid Participants");
      }
      const roomId = uuid();
      const [newGroup] = await this._chatModel.create({
        data: [{
            createdBy: req.user?._id as Types.ObjectId,
            participants:[ ...dbParticipants, req.user?._id as Types.ObjectId],
            group,
            roomId,
        }],
      }) || [];
        if(!newGroup) throw new BadRequestException("Fail to Create Group Chat");
        return res.status(200).json({message:"Done!",data: {newGroup}});
    };


    // ==================== Socket – Simple Hello / Test Message Handler ====================

    sayHi = ({message , socket , callback, io}:ISayHiDTO) => {
    try {
    console.log(message);
    callback ? callback(" i received your message: " + message) : null;

    } catch (error) {
        socket.emit("custom_error", error);
    }
        };


    // ==================== Socket – Send Private Message (One-to-One) ====================

    sendMessage = async({content, sendTo, socket, io}:ISendMessageDTO) => {

    try {
    const createdBy = socket.credentials?.user._id as Types.ObjectId;

    const user = await this._userModel.findOne({
        filter:{_id: Types.ObjectId.createFromHexString(sendTo)
            friends: {$in: [createdBy]},
        },
    })
    if(!user) throw new NotFoundException("User Not Found");

    const chat = await this._chatModel.findOneAndUpdate({
        filter: {participants: {
        $all: [createdBy as Types.ObjectId, Types.ObjectId.createFromHexString(sendTo)],
    },          
    group: {$exists: false},
    },
    update: {
        $addToSet: {
            messages: {
                content, 
                createdBy,
            },       
            },
    },
    });
    if(!chat) {
        const [newChat] = await this._chatModel.create({
            data: [{
                createdBy,
                messages: [{content, createdBy}],
                participants: [createdBy, Types.ObjectId.createFromHexString(sendTo)],

            }]
        }) || [];
        if(!newChat) throw new BadRequestException("Fail to Create Chat");
    }
    socket.emit("successMessage",{ content});
    socket.emit("new_message", { content,from: socket.credentials?.user});    
    } catch (error) {
            socket.emit("custom_error", error);
    }  
    };


    // ==================== Socket – Join Group Chat Room ====================

    joinRoom = async({roomId, socket,}:IJoinRoomDTO) => {

    try {
     const chat = await this._chatModel.findOne({
        filter: {roomId,
             participants: {
                $in: [socket.credentials?.user._id as Types.ObjectId]},
                group: {$exists: true},
        },
     });
    if(!chat) throw new NotFoundException("Fail to join room");
    socket.join(chat.roomId as string);
    } catch (error) {
            socket.emit("custom_error", error);
    }  
    };


    // ==================== Socket – Send Message to Group ====================

    sendGroupMessage = async({content, groupId, socket, io}:ISendGroupMessageDTO) => {

    try {
    const createdBy = socket.credentials?.user._id as Types.ObjectId;
    const chat = await this._chatModel.findOneAndUpdate({
        filter: {
            _id: Types.ObjectId.createFromHexString(groupId),
            participants: {
                $in: [createdBy as Types.ObjectId],
            },
            group: {$exists: true},
            
        },
        update: {
            $addToSet: {
                messages: {
                    content, 
                    createdBy,
                },
            },
        },
    });
    if(!chat) throw new NotFoundException("Fail To Matching Group");
    io?.emit("successGroupMessage",{ content});
    } catch (error) {
            socket.emit("custom_error", error);
    }  
    };


}

// ==================== Export Singleton Instance ====================

export default new ChatService();