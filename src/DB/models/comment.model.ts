// ==================== Import Mongoose Dependencies & Types ====================
import { HydratedDocument, model, models, Schema, Types } from "mongoose";

// ==================== Comment Interface Definition ====================
export interface IComment {
    content?: string;
    attachments?: string[];


    tags?: Types.ObjectId[];
    likes?: Types.ObjectId[];

    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    postId: Types.ObjectId;
    commentId?:Types.ObjectId;

    freezedBy?: Types.ObjectId;
    freezedAt?: Date;

    storedBy?: Types.ObjectId;
    storedAt?: Date;
}

// ==================== Hydrated Document Type Export ====================
export type HCommentDocument = HydratedDocument<IComment>;

// ==================== Comment Schema Implementation ====================
const commentSchema = new Schema<IComment>({
// ==================== Content Field with Conditional Required Logic ====================
    content : {
        type: String,
        minlength: 2,
        maxlength: 500000,
        required: function(this: IComment) { 
            return !this.attachments?.length;
        },
    },
// ==================== Media & Social Interactions Fields ====================
    attachments: [String],
    likes: [{type: Schema.Types.ObjectId , ref: "User"}],
    tags: [{type: Schema.Types.ObjectId , ref: "User"}],
    
// ==================== Foreign Key References (User & Post) ====================
    commentId: {type: Schema.Types.ObjectId , ref: "User", required: true}, 

    createdBy: {type: Schema.Types.ObjectId , ref: "User", required: true}, 
    postId: {type: Schema.Types.ObjectId , ref: "Post", required: true}, 

// ==================== Administrative / Audit Fields (Freeze & Store) ====================
    freezedBy: {type: Schema.Types.ObjectId , ref: "User"},
    freezedAt: Date,
    
    storedBy: {type: Schema.Types.ObjectId , ref: "User"},
    storedAt: Date,

} , {
// ==================== Schema Options (Timestamps) ====================
    timestamps: true,
});

// ==================== Export Comment Model ====================
export const CommentModel =  models.comment || model<IComment>("Comment", commentSchema);