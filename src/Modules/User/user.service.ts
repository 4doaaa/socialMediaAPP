// ==================== Imports & Required Modules ====================
import {  Request, Response } from "express";
import { LogoutDTO } from "./user.dto";
import { createRevokeToken, LogoutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { UpdateQuery } from "mongoose";
import { IUser, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { createPresignedURL, uploadFiles, uploadLargeFile } from "../../Utils/multer/s3.config";

// ==================== Authentication Service Class ====================
class UserService {
    private _userModel = new UserRepository(UserModel);
    
    constructor() {}

    // ==================== Get Authenticated User Profile ====================
    getProfile = async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json({
             message:"Done" ,
             data:{user: req.user , decoded:req.decoded}
         });
    };

    // ==================== User Logout (Single Device or All Devices) ====================
    logout = async (req: Request, res: Response): Promise<Response> => {
        const { flag } :LogoutDTO = req.body ;
        
        let statusCode: number = 200 ;
        const update: UpdateQuery<IUser> = { };
        
        switch (flag) {
            case LogoutEnum.ONLY:
                await createRevokeToken(req.decoded as JwtPayload); ;
                statusCode = 201 ;
                break;
            case LogoutEnum.ALL:
                update.changeCredentialsTime = new Date();
                break;
            default:
                break;
        }

        await this._userModel.updateOne({
            filter: {_id: req.decoded?.id},
            update,
        });

        return res.status(statusCode).json({
                 message:"Done" ,
             });
    };

    // ==================== Upload / Update Profile Image (Using Pre-signed URL) ====================
    profileImage = async (req: Request, res: Response): Promise<Response> => {
       
        // const Key = await uploadFile({
        //     path: `users/${req.decoded?.id}`,
        //     file: req.file as Express.Multer.File,
        // });

        // const Key = await uploadLargeFile({    path: `users/${req.decoded?.id}`,
        //  file: req.file as Express.Multer.File,});

        const {ContentType, originalname}:{ContentType: string, originalname: string} = req.body;

        const {url, Key} = await createPresignedURL({
            ContentType,
            originalname,
            path: `users/${req.decoded?.id}`,
        });
        
        await this._userModel.updateOne({
            filter: {_id: req.decoded?.id},
            update: {profileImage: Key},
        });

        return res.status(200).json({ message:"Done", url, Key });
    };

    // ==================== Upload Multiple Cover Images ====================
    coverImages = async (req: Request, res: Response): Promise<Response> => {
       
      const urls = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path:`users/${req.decoded?.id}/cover`,
      });

      return res.status(200).json({
           message:"Done" ,
           urls,
       });
    }
}

// ==================== Export Service Instance & Type ====================
export default new UserService();