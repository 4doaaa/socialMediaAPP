// ==================== Import Dependencies & Core Modules ====================
import { NextFunction, Request, Response } from "express";
import { LogoutDTO } from "./user.dto";
import { createRevokeToken, LogoutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { Types, UpdateQuery } from "mongoose";
import { IUser, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { createPresignedURL, uploadFiles } from "../../Utils/multer/s3.config";
import { ConflictException, NotFoundException } from "@aws-sdk/client-sesv2";
import { BadRequestException } from "../../Utils/response/error.response";
import { FriendRepository } from "../../DB/repository/friend.repository";
import { FriendModel } from "../../DB/models/friendRequest.model";
import { ChatRepository } from "../../DB/repository/chat.repository";
import { ChatModel } from "../../DB/models/chat.model";

// ==================== User Service Class Implementation ====================
class UserService {
    private _userModel = new UserRepository(UserModel);
    private _friendModel = new FriendRepository(FriendModel);
    private _chatModel = new ChatRepository(ChatModel);

    constructor() {}

    // ==================== Get User Profile Logic ====================
    getProfile = async (req: Request, res: Response): Promise<Response> => {
    await req.user?.populate('friends'); 

    const groups = await this._chatModel.find({
        filter: {
            group: { $exists: true },
            participants: { $in: [req.user?._id as Types.ObjectId] },
        },
    })
        return res.status(200).json({
            message: "Done",
            data: { user: req.user, decoded: req.decoded, groups },
        });
    };

    // ==================== User Logout & Token Revocation Logic ====================
    logout = async (req: Request, res: Response): Promise<Response> => {
        const { flag }: LogoutDTO = req.body;

        let statusCode: number = 200;
        const update: UpdateQuery<IUser> = {};

        switch (flag) {
            case LogoutEnum.ONLY:
                await createRevokeToken(req.decoded as JwtPayload);
                statusCode = 201;
                break;

            case LogoutEnum.ALL:
                update.changeCredentialsTime = new Date();
                break;

            default:
                throw new BadRequestException("Invalid logout flag");
        }

        await this._userModel.updateOne({
            filter: { _id: req.decoded?.id },
            update,
        });

        return res.status(statusCode).json({
            message: "Done",
        });
    };

    // ==================== Profile Image Management (S3 Presigned URL) ====================
    profileImage = async (req: Request, res: Response): Promise<Response> => {
        const { contentType, originalname } = req.body as {
            contentType: string;
            originalname: string;
        };

        if (!contentType || !originalname) {
            throw new BadRequestException("contentType and originalname are required");
        }

        const { url, Key } = await createPresignedURL({
            ContentType: contentType,
            originalname,
            path: `users/${req.decoded?.id}`,
        });

        await this._userModel.updateOne({
            filter: { _id: req.decoded?.id },
            update: { profileImage: Key },
        });

        return res.status(200).json({ message: "Done", url, Key });
    };

    // ==================== Bulk Cover Images Upload Logic ====================
    coverImages = async (req: Request, res: Response): Promise<Response> => {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw new BadRequestException("No files uploaded");
        }

        const urls = await uploadFiles({
            files: req.files as Express.Multer.File[],
            path: `users/${req.decoded?.id}/cover`,
        });

        return res.status(200).json({
            message: "Done",
            urls,
        });
    };

    // ==================== Friend Request Logic ====================
sendFriendRequest = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.params.userId;

    if (!userId) {
        throw new BadRequestException("userId parameter is required in the URL");
    }

    if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException("Invalid user ID format");
    }

    const targetUserId = new Types.ObjectId(userId);
    const currentUserId = req.user?._id;

    if (!currentUserId) {
        throw new BadRequestException("Authenticated user not found");
    }

    if (currentUserId.equals(targetUserId)) {
        throw new BadRequestException("You cannot send a friend request to yourself");
    }

    // Check if a request already exists in either direction
    const existingRequest = await this._friendModel.findOne({
        filter: {
            $or: [
                { createdBy: currentUserId, sendTo: targetUserId },
                { createdBy: targetUserId, sendTo: currentUserId },
            ],
        },
    });

    if (existingRequest) {
        throw new ConflictException("Friend request already exists");
    }

    // Verify that the target user actually exists
    const targetUser = await this._userModel.findById({
        filter: { _id: targetUserId },
    });

    if (!targetUser) {
        throw new NotFoundException("Target user not found");
    }

    // Create the friend request
    const createdRequests = await this._friendModel.create({
        data: [
            {
                createdBy: currentUserId,
                sendTo: targetUserId,
            },
        ],
    });

    const newRequest = createdRequests?.[0];

    if (!newRequest) {
        throw new BadRequestException("Failed to create friend request");
    }

    return res.status(201).json({
        message: "Friend Request Sent",
        data: newRequest,
    });
};
// ==================== Accept Friend Request Logic ====================
acceptFriendRequest = async (req: Request, res: Response): Promise<Response> => {
    const { requestId } = req.params;

    if (!requestId || !Types.ObjectId.isValid(requestId)) {
        throw new BadRequestException("Invalid or missing Request ID");
    }

    const request = await this._friendModel.findOneAndUpdate({
        filter: {
            _id: new Types.ObjectId(requestId),
            sendTo: req.user!._id, // لازم أكون أنا اللي مستلمة الطلب عشان أقبله
            status: "pending" 
        },
        update: { 
            status: "accepted", 
            acceptedAt: new Date() 
        }
    });

    
    if (!request) {
        throw new BadRequestException("Friend request not found, already processed, or you are not authorized to accept it");
    }


    return res.status(200).json({
        message: "Friend Request Accepted Successfully",
        data: request,
    });
};
}

// ==================== Export Service Instance ====================
export default new UserService();