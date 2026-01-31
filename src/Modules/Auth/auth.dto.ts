// ==================== Zod Schema Import ====================
import * as z from "zod";
import { confirmEmailSchema, loginSchema, signUpSchema } from "./auth.validation";

// ==================== Signup Data Transfer Object Type ====================
export type ISignupDTO = z.infer<typeof signUpSchema.body>;

// ==================== Login ====================
export type ILoginDTO = z.infer<typeof loginSchema.body>;

// ==================== Confirm Email ====================
export type IConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;