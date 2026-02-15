// ==================== Import Dependencies & Modules ====================
import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validation.middleware";
import { createPostSchema, likePostSchema } from "./post.validation";
import postService from "./post.service";
import commentRouter from "../comment/comment.controller"

// ==================== Initialize Router & Sub-Routes ====================
const router: Router = Router();
router.use("/:postId/comment", commentRouter)

// ==================== Create Post Endpoint ====================
router.post(
    "/",
    authentication({tokenType: tokenTypeEnum.ACCESS,accessRoles: [RoleEnum.USER]}),
    validation(createPostSchema),
    postService.createPost.bind(postService),
);

// ==================== Like/Unlike Post Endpoint ====================
router.patch(
    "/:postId/like",
    authentication({tokenType: tokenTypeEnum.ACCESS,accessRoles: [RoleEnum.USER]}),
    validation(likePostSchema),
    postService.likePost,
);

// ==================== Get All Posts Endpoint ====================
router.get(
    "/",
    authentication({tokenType: tokenTypeEnum.ACCESS,accessRoles: [RoleEnum.USER]}),
    postService.getAllPosts,
);

// ==================== Export Router ====================
export default router;