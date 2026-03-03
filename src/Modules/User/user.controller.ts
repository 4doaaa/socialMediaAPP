// ==================== Module Imports & Dependencies ====================

import { Router } from "express";
import userService from "./user.service";
import { tokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model"; 
import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import { logoutSchema } from "./user.validation";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../Utils/multer/cloud.multer";
import * as validators from "./user.validation";
import { endpoint } from "./user.authorization";
import chatRouter from "../chat/chat.controller";


// ==================== Express Router Initialization ====================

const router = Router();


// ==================== Mount Chat Sub-Router (Nested under /:userId/chat) ====================

router.use("/:userId/chat" , chatRouter);


// ==================== GET – Retrieve User Profile ====================
router.get(
  "/profile",
  authentication(endpoint.profile),
  userService.getProfile
);


// ==================== POST – User Logout ====================
router.post(
  "/logout",
  authentication(endpoint.logout),
  validation(logoutSchema),
  userService.logout
);


// ==================== PATCH – Upload / Update Profile Image ====================

router.patch(
  "/profile-image",
  authentication(endpoint.profileImage),
  cloudFileUpload({
    validation: fileValidation.images,
    storageApproach: StorageEnum.MEMORY,
    maxSizeMB: 6,
  }).single("attachments"),
  userService.profileImage
);


// ==================== PATCH – Upload Multiple Cover Images ====================

router.patch(
  "/cover-images",
  authentication(tokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    validation: fileValidation.images,
    storageApproach: StorageEnum.MEMORY,
    maxSizeMB: 6,
  }).array("attachments", 5),
  userService.coverImages
);


// ==================== POST – Send Friend Request to Another User ====================

router.post(
  "/:userId/friend-request",
  authentication(endpoint.friendRequest, tokenTypeEnum.ACCESS),
  validation(validators.sendFriendRequestSchema), 
  userService.sendFriendRequest
);


// ==================== PATCH – Accept Received Friend Request ====================

router.patch(
  "/:requestId/accept",
  authentication(tokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(validators.acceptFriendRequestSchema),
  userService.acceptFriendRequest
);


// ==================== Export Configured Router ====================

export default router;