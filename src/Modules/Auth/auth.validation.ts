import * as z from "zod";
import { generalFields } from "../../Middlewares/validation.middleware";

// ==================== Login Validation Schema ====================

export const loginSchema = {
    body: z.strictObject({
        email: generalFields.email,
        password: generalFields.password,
    }),
};

// ==================== Signup Validation Schema ====================

export const signUpSchema = {
    body: loginSchema.body
        .extend({
            username: generalFields.username,
            confirmPassword: generalFields.confirmPassword,
        })
        .superRefine((data, ctx) => {
            // Password and confirmPassword must match
            if (data.password !== data.confirmPassword) {
                ctx.addIssue({
                    code: "custom",
                    path: ["confirmPassword"],
                    message: "Password Mismatch",
                });
            }

            // Username must contain exactly 2 words (first name + last name)
            if (data.username.trim().split(/\s+/).length !== 2) {
                ctx.addIssue({
                    code: "custom",
                    path: ["username"],
                    message: "Username must contain exactly 2 words (first and last name)",
                });
            }
        }),
};

// ==================== Confirm Email Validation Schema ====================

export const confirmEmailSchema = {
    body: z.strictObject({
        email: generalFields.email,
        otp: generalFields.otp,
    }),
};
