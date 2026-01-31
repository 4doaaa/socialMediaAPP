import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../Utils/response/error.response";
import { z } from "zod"; // Correct import

// ==================== Types for Validation Middleware ====================

type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, z.ZodTypeAny>>;

// ==================== Validation Middleware ====================
// Generic middleware that validates any part of the request (body, query, params, etc.) using Zod schemas
export const validation = (schema: SchemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: Array<{
            key: KeyReqType;
            issues: Array<{ message: string; path: (string | number | symbol)[] }>;
        }> = [];

        for (const key of Object.keys(schema) as KeyReqType[]) {
            if (!schema[key]) continue;

            const validationResult = schema[key]!.safeParse(req[key]);

            if (!validationResult.success) {
                const errors = validationResult.error as z.ZodError;

                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => ({
                        message: issue.message,
                        path: issue.path,
                    })),
                });
            }
        }

        if (validationErrors.length > 0) {
            throw new BadRequestException("Validation Error", {
                cause: validationErrors,
            });
        }

        // Remove debug logs in production
        // console.log(schema);
        // console.log(Object.keys(schema));

        next();
    };
};

// ==================== General Reusable Validation Fields ====================
// Common Zod schemas used across different routes (signup, login, confirm email, etc.)
export const generalFields = {
    username: z
        .string({ message: "Username is required" })
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(30, { message: "Username must be at most 30 characters long" }),

    email: z.string({ message: "Email is required" }).email({ message: "Invalid email address" }),

    password: z.string({ message: "Password is required" }),

    confirmPassword: z.string({ message: "Confirm password is required" }),

    otp: z
        .string({ message: "OTP is required" })
        .regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits" }),
};