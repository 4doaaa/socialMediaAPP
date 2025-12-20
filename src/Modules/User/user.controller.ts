import { Router } from "express";
import { tokenTypeEnum } from "../../Utils/security/token";
import userService from "./user.service";
import { RoleEnum } from "../../DB/models/user.model";
import { authentication } from "../../Middlewares/authentication.middleware";
// ==================== Auth Router Definition ====================

const router: Router = Router();

// ==================== Authentication Routes ====================

router.get("/profile", authentication({
    tokenType: tokenTypeEnum.ACCESS,
    accessRoles: [RoleEnum.USER],
}), 
userService.getProfile);

// ==================== Export Router ====================

export default router;