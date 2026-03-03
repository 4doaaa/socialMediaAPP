// ==================== Import Dependencies & Types ====================
import {HydratedDocument, model,models,Schema, Types } from "mongoose";

// ====================  Interface Definition ====================
export interface IFriendRequest {
     createdBy: Types.ObjectId;
    sendTo: Types.ObjectId;
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
}

// ====================  Schema Implementation ====================
export const friendSchema = new Schema<IFriendRequest> ({ 
   createdBy: {
    type:Schema.Types.ObjectId,
    required: true,
    ref:"User",
   },
   sendTo: {
    type:Schema.Types.ObjectId,
    required: true,
    ref:"User",
   },
   acceptedAt: {
    type: Date,
   }
},
 {timestamps: true});


// ==================== Model Export ====================
export const FriendRequestModel = models.FriendRequest || model<IFriendRequest>("FriendRequest", friendSchema);
export type HFriendRequestDocument = HydratedDocument<IFriendRequest>;