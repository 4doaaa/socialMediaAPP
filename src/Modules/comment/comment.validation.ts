// ==================== Import Dependencies ====================
import { z } from "zod"
import { generalFields } from "../../Middlewares/validation.middleware"
import { fileValidation } from "../../Utils/multer/cloud.multer"

// ==================== Create Comment Schema Definition ====================
export const createCommentSchema = {
// ==================== Request Parameters Validation ====================
    params: z.strictObject({
        postId: generalFields.id,
    }),
// ==================== Request Body Validation & Logic ====================
    body: z.strictObject({
        content: z.string().min(2).max(500000).optional(),
        attachments: z
        .array(generalFields
            .file(fileValidation.images))
            .max(3).optional(),
            tags: z.array(generalFields.id)
            .max(10)
            .optional(),
    }).superRefine((data,ctx)=>{
// ==================== Content & Attachments Requirements Check ====================
     if (!data.content && (!data.attachments || data.attachments.length === 0)) {
        ctx.addIssue({
            code: "custom",
            path: ["content"],
            message:"Please Provide Content OR Attachement "
        });
      }
// ==================== Unique Tags Validation ====================
      if(
         data.tags?.length &&
         data.tags.length !== [...new Set(data.tags)].length
) {
    ctx.addIssue({
        code:"custom",
        path:["tags"],
        message:"Please Provide unique tags",
    });
}
    }),
};