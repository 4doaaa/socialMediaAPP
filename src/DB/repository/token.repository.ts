import { IToken } from "../models/token.model";
import { DatabaseRepository } from "./database.repository";
import {_QueryFilter, Model } from "mongoose";


// ==================== Token Repository ====================
export  class TokenRepository extends DatabaseRepository<IToken> {
    constructor(protected override readonly model: Model<IToken>) {
        super(model);
    }
   
}