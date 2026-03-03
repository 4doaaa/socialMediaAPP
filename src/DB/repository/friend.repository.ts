import { FriendRequestModel, IFriendRequest } from "../models/friendRequest.model";
import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";

export class FriendRepository extends DatabaseRepository<IFriendRequest> {
  constructor(protected override readonly model: Model<IFriendRequest>) {
    super(FriendRequestModel);
  }
}
