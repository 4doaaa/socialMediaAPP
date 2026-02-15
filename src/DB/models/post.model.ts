// ==================== Import Mongoose Dependencies & Types ====================
import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { ref } from "process";

// ==================== Post Enumerations (Settings & Actions) ====================
export enum AllowCommentsEnum {
    ALLOW = "Allow",
    DENY = "DENY",
}

export enum AvailabilityEnum {
    PUBLIC = "PUBLIC",
    FRIENDS = "FRIENDS",
    ONLY_ME = "ONLY_ME",
}

export enum LikeUnlikeEnum {
    LIKE = "LIKE",
    UNLIKE = "UNLIKE",
}

// ==================== Post Interface Definition ====================
export interface IPost {
    content?: string;
    attachments?: string[];
    assetPostFolderId?:String;

    allowComments: AllowCommentsEnum;
    availability: AvailabilityEnum;
    
    tags?: Types.ObjectId[];
    likes?: Types.ObjectId[];

    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

    freezedBy?: Types.ObjectId;
    freezedAt?: Date;

    storedBy?: Types.ObjectId;
    storedAt?: Date;
}

// ==================== Hydrated Document Type Export ====================
export type HPostDocument = HydratedDocument<IPost>;

// ==================== Post Schema Implementation ====================
const postSchema = new Schema<IPost>({
// ==================== Content & Asset Storage Fields ====================
    content : {
        type: String,
        minlength: 2,
        maxlength: 500000,
        required: function(this: IPost) { 
            return !this.attachments?.length;
        },
    },
    assetPostFolderId: String,
    attachments: [String],

// ==================== Privacy & Interaction Settings ====================
    allowComments: {
        type: String,
        enum: Object.values(AllowCommentsEnum),
        default: AllowCommentsEnum.ALLOW,
    },
    availability: {
        type: String,
        enum: Object.values(AvailabilityEnum),
        default: AvailabilityEnum.PUBLIC,
    },

// ==================== Social Interactions & Ownership ====================
    likes: [{type: Schema.Types.ObjectId , ref: "User"}],
    tags: [{type: Schema.Types.ObjectId , ref: "User"}],
    createdBy: {type: Schema.Types.ObjectId , ref: "User", required: true}, 
    
// ==================== Administrative Audit Fields ====================
    freezedBy: {type: Schema.Types.ObjectId , ref: "User"},
    freezedAt: Date,
    
    storedBy: {type: Schema.Types.ObjectId , ref: "User"},
    storedAt: Date,

} , {
// ==================== Schema Options (Timestamps) ====================
    timestamps: true,
});

// ==================== Export Post Model ====================
export const PostModel =  models.Post || model<IPost>("Post", postSchema);