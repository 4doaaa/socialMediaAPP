// ==================== Required Type Imports ====================
import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../../DB/models/user.model"; 
import { Document } from "mongoose";

// ==================== Custom User Document Type (Hydrated User) ====================
export type HUserDocument = Document<any, any, IUser> & IUser;

// ==================== Express Request Augmentation (Type Declaration Merging) ====================
declare module "express-serve-static-core" {
    interface Request {
        user?: HUserDocument;
        decoded?: JwtPayload;
    }
}