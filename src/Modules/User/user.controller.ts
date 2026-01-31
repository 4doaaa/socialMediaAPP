// ==================== Imports & Required Modules ====================
import { Router } from "express";
import { tokenTypeEnum } from "../../Utils/security/token";
import userService from "./user.service";
import { RoleEnum } from "../../DB/models/user.model";
import { authentication } from "../../Middlewares/authentication.middleware";
import { validation } from "../../Middlewares/validation.middleware";
import { logoutSchema } from "./user.validation";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../Utils/multer/cloud.multer";

// ==================== Auth Router Definition ====================
const router: Router = Router();

// ==================== Get Authenticated User Profile ====================
router.get("/profile", 
    authentication({
        tokenType: tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER],
    }), 
    userService.getProfile
);

// ==================== Logout Endpoint (Single / All Devices) ====================
router.post("/logout", 
    authentication({
        tokenType: tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER],
    }), 
    validation(logoutSchema),
    userService.logout
);

// ==================== Update Profile Image (Single File Upload) ====================
router.patch(
    "/profile-image",
    authentication({
        tokenType: tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER],
    }), 
    cloudFileUpload({
        validation: fileValidation.images,
        storageApproach: StorageEnum.MEMORY,
        maxSizeMB: 6,
    }).single("attachments"),
    userService.profileImage
);

// ==================== Upload Multiple Cover Images (Up to 5 Files) ====================
router.patch(
    "/cover-images",
    authentication({
        tokenType: tokenTypeEnum.ACCESS,
        accessRoles: [RoleEnum.USER],
    }), 
    cloudFileUpload({
        validation: fileValidation.images,
        storageApproach: StorageEnum.MEMORY,
        maxSizeMB: 6,
    }).array("attachments", 5),
    userService.coverImages
);

// ==================== Export User Router ====================
export default router;