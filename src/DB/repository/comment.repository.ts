// ==================== Import Dependencies & Types ====================
import { IComment } from "../models/post.model";
import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";

// ==================== Comment Repository Class Implementation ====================
export class CommentRepository extends DatabaseRepository<IComment> {
// ==================== Constructor & Model Initialization ====================
  constructor(protected override readonly model: Model<IComment>) {
    super(model);
  }
}