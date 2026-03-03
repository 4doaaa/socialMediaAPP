// ==================== Import Mongoose Dependencies & Types ====================
import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IMessage {
content: string;
createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;

}
// ==================== Post Interface Definition ====================
export interface IChat {
participants: Types.ObjectId[];
messages: IMessage[];

group?: string;
group_image?: string;
roomId?: string;
createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

}

// ==================== Hydrated Document Type Export ====================
export type HChatDocument = HydratedDocument<IChat>;
export type HMessageDocument = HydratedDocument<IMessage>;

export const messageSchema = new Schema<IMessage>({
    content: {
        type: String,
        required: true,
        maxlength: 500000,
        minlength: 2,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
} , {timestamps: true,});



export const chatSchema = new Schema<IChat>({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    group: String,
    group_image: String,
    roomId: {
        type: String,
        required: function() {
            return this.roomId;
        },
    },
    messages: [messageSchema],
} , {timestamps: true,});

// ==================== Export Post Model ====================
export const ChatModel =  models.Chat || model<IChat>("Chat", chatSchema);