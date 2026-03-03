import * as z from "zod";
import { generalFields } from "../../Middlewares/validation.middleware";

// ==================== Login Validation Schema ====================
export const loginSchema = z.object({
    body: z.strictObject({
        email: z.string().email(),
        password: z.string().min(8),
    }),
});

// ==================== Signup Validation Schema ====================
export const signUpSchema = z.object({ 
    username: generalFields.username,
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: "custom",
            path: ["confirmPassword"],
            message: "Passwords don't match",
        });
    }
    if (data.username && data.username.trim().split(/\s+/).length !== 2) {
        ctx.addIssue({
            code: "custom",
            path: ["username"],
            message: "Username must be exactly two words",
        });
    }
});

// ==================== Confirm Email Validation Schema ====================
export const confirmEmailSchema = z.object({
    body: z.object({
        email: generalFields.email,
        otp: generalFields.otp,
    }),
});