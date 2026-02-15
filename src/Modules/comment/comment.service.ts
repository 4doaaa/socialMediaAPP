// ==================== Import Required Models and Repositories ====================
import { AllowCommentsEnum, PostModel } from "../../DB/models/post.model";
import { UserModel } from "../../DB/models/user.model";
import { CommentRepository } from "../../DB/repository/comment.repository";
import { PostRepository } from "../../DB/repository/post.repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { Request , Response } from "express";
import {CommentModel} from "../../DB/models/comment.model";
import { BadRequestException, NotFoundException } from "../../Utils/response/error.response";
import { deleteFiles, uploadFiles } from "../../Utils/multer/s3.config";


// ==================== Comment Service Class Definition ====================
class CommentService {


    // ==================== Private Repository Instances ====================
    private _userModel = new UserRepository(UserModel);
    private _postModel = new PostRepository(PostModel);
    private _commentModel = new CommentRepository(CommentModel);

    // ==================== Constructor ====================
    constructor() {}

    // ==================== Create Comment Endpoint Handler ====================
    createComment = async (req:Request , res:Response) =>{

        // ==================== Extract postId from URL Parameters ====================
        const {postId} = req.params as unknown as {postId:string}

        // ==================== Find Post and Check Comment Permission ====================
        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                allowComments: AllowCommentsEnum.ALLOW,
            },
        });

        // ==================== Post Not Found or Comments Disabled ====================
        if(!post) throw new NotFoundException("Fail To Match Results");

        // ==================== Validate Mentioned Users (tags) Existence ====================
        if(
            req.body.tags?.length &&
            (await (this._userModel.find({
                filter: { _id: { $in: req.body.tags } }
            }
            ))).length !== req.body.tags.length
        ){ 
            throw new NotFoundException("Some Mentioned User Does Not Exists")
        } 

        // ==================== Initialize Attachments Array ====================
        let attachments: string[] = [];

        // ==================== Handle File Uploads if Files Exist ====================
        if(req.files?.length) {
            attachments = await uploadFiles({
                files: req.files as Express.Multer.File[],
                path:`users/${post.createdBy}/post/${post.assetPostFolderId}`,
            });
        }

        // ==================== Create New Comment Document ====================
        const [comment] = (await this._commentModel.create({
        data: [{
            ...req.body,
            attachments,
            postId, //جايلي من ال param
            createdBy: req.user?._id,

        }]

        }))  || [];

        // ==================== Handle Comment Creation Failure + Cleanup ====================
        if(!comment) {
            if (attachments.length){
                await deleteFiles({ urls: attachments});
            }
                throw new BadRequestException("Fail To Create Comment");

        }

        // ==================== Success Response ====================
        return res.status(201).json({message:"Comment Created Successfully"});
    };
}


// ==================== Export Singleton Instance of CommentService ====================
export default new CommentService();