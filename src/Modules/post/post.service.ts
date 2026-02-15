// ==================== Import Dependencies & Models ====================
import { BadRequestException, NotFoundException } from "../../Utils/response/error.response";
import { AvailabilityEnum, LikeUnlikeEnum, PostModel } from "../../DB/models/post.model";
import { UserModel } from "../../DB/models/user.model";
import { PostRepository } from "../../DB/repository/post.repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { Request , Response } from "express";
import { deleteFiles, uploadFiles } from "../../Utils/multer/s3.config";
import {v4 as uuid} from "uuid";
import { UpdateQuery } from "mongoose";
import { HUserDocument } from "request.express";

// ==================== Post Service Class Definition ====================
class PostService {

    private _userModel = new UserRepository(UserModel);
    private _postModel = new PostRepository(PostModel);

    constructor() {}

// ==================== Create Post Method ====================
createPost = async(req: Request, res: Response) =>{

// ==================== Validate Mentioned Users (Tags) ====================
if(
    req.body.tags?.length &&
    (this._userModel.find({
        filter: { _id: { $in: req.body.tags } }
    }
    )).length !== req.body.tags.length
){ 
    throw new NotFoundException("Some Mentioned User Does Not Exists")
} 

// ==================== Handle File Uploads (S3) ====================
let attachments: string[] = [];
let assetPostFolderId = uuid();
 
if(req.files?.length) {
    attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path:`users/${req.user?._id}/post/${assetPostFolderId}`,
    });
}

// ==================== Save Post to Database ====================
const [post] = (await this._postModel.create({
data: [{
    ...req.body,
    attachments,
    assetPostFolderId,
    createdBy: req.user?._id,

}]

}))  || [];

// ==================== Error Handling & Cleanup ====================
if(!post) {
    if (attachments.length){
        await deleteFiles({ urls: attachments});
    }
         throw new BadRequestException("Fail To Create Comment");

}
return res.status(201).json({message: "Post Created Successfully", post })

 };

// ==================== Like / Unlike Post Method ====================
likePost = async (req:Request ,res:Response) =>{
    const {postId} = req.params as unknown as {postId:String};
    const { action } = req.query as unknown as { action: String};

    let update: UpdateQuery<HUserDocument> = {
        $addToSet: { likes: req.user?._id},
    };

    if(action === LikeUnlikeEnum.UNLIKE) {
        update = {$pull: {likes: req.user?._id}};
    }
    const post = await this._postModel.findOneAndUpdate({
        filter: {_id:postId , availability: AvailabilityEnum.PUBLIC},
        update,
    });

    if(!post) throw new NotFoundException("Post Does Not Exists");
    return res.status(200).json({message:"Done" , post });
 };

// ==================== Get All Public Posts Method ====================
getAllPosts = async (req:Request ,res:Response) => {
    let {page , size } = req.query as unknown as { page:number, size:number };

    const posts = this._postModel.find({
        filter: { availability: AvailabilityEnum.PUBLIC },
        page,
        size,
        select: ""
    });

    return res
    .status(200)
    .json({message:"Posts Fetched Succcessfully", posts });
 };
}

// ==================== Export Service Instance ====================
export default new PostService();