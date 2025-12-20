"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFields = exports.validation = void 0;
const error_response_1 = require("../Utils/response/error.response");
const zod_1 = require("zod");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
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
            throw new error_response_1.BadRequestException("Validation Error", {
                cause: validationErrors,
            });
        }
        next();
    };
};
exports.validation = validation;
exports.generalFields = {
    username: zod_1.z
        .string({ message: "Username is required" })
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(30, { message: "Username must be at most 30 characters long" }),
    email: zod_1.z.string({ message: "Email is required" }).email({ message: "Invalid email address" }),
    password: zod_1.z.string({ message: "Password is required" }),
    confirmPassword: zod_1.z.string({ message: "Confirm password is required" }),
    otp: zod_1.z
        .string({ message: "OTP is required" })
        .regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits" }),
};
