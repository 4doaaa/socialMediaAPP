import { Router } from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validation.middleware";
import { confirmEmailSchema, signUpSchema } from "./auth.validation";

// ==================== Auth Router Definition ====================

const router: Router = Router();

// ==================== Authentication Routes ====================

router.post("/signup", validation(signUpSchema), authService.signup);

router.post("/login", authService.login);

router.patch("/confirm-email", validation(confirmEmailSchema), authService.confirmEmail);

// ==================== Export Router ====================

export default router;