// ==================== Import Dependencies & Enums ====================
import { z } from 'zod'; 
import { generalFields } from "../../Middlewares/validation.middleware";
import { fileValidation } from "../../Utils/multer/cloud.multer";
import { AllowCommentsEnum, AvailabilityEnum, LikeUnlikeEnum } from "../../DB/models/post.model";

// ==================== Create Post Schema Definition ====================
export const createPostSchema = {
// ==================== Request Body Validation Fields ====================
    body: z.strictObject ({
        content: z.string().min(2).max(500000).optional(),
        attachments: z
        .array(generalFields.file(fileValidation.images))
        .max(3)
        .optional(),
        AllowComments: z.enum(AllowCommentsEnum).default(AllowCommentsEnum.ALLOW),
        Availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.PUBLIC),
        likes: z.array(generalFields.id).optional(),
        tags: z.array(generalFields.id).max(20).optional(),
    }).superRefine((data,ctx)=>{
// ==================== Content & Attachments Co-dependency Check ====================
if(!data.attachments?.length && !data.content) {
    ctx.addIssue({
        code:"custom",
        path:["content"],
        message:"Please Provide content or attachments",
    });
}
// ==================== Unique Tags Verification ====================
if(data.tags?.length && data.tags.length !== [...new Set(data.tags)].length) {
    ctx.addIssue({
        code:"custom",
        path:["tags"],
        message:"Please provide Unique Tags",
    });
}
    }),
};

// ==================== Like Post Schema Definition ====================
export const likePostSchema = {
// ==================== Post ID Parameter Validation ====================
    params: z.strictObject({
        postId: generalFields.id,
    }),
// ==================== Like/Unlike Action Query Validation ====================
    query :z.strictObject({
        action: z.enum(LikeUnlikeEnum).default(LikeUnlikeEnum.LIKE)
    })
};