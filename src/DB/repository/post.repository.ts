import { IPost } from "../models/post.model";
import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";

export class PostRepository extends DatabaseRepository<IPost> {
  constructor(protected override readonly model: Model<IPost>) {
    super(model);
  }
}