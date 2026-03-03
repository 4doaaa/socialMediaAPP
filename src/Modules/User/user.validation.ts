// ==================== Module Imports & Dependencies ====================

import z from "zod";
import { generalFields } from "../../Middlewares/validation.middleware";
import { LogoutEnum } from "../../Utils/security/token";
import { SchemaType } from "mongoose";


// ==================== Logout Schema  (Body Validation) ====================
export const logoutSchema = {
  body: z.object({
    flag: z.nativeEnum(LogoutEnum).default(LogoutEnum.ONLY),
  }),
};


// ==================== Zod Schema – Accept Friend Request (Params Validation) ====================
export const acceptFriendRequestSchema = {
  params: z.object({
    requestId: generalFields.id,
  }),
};


// ==================== Zod Schema – User Sign Up (Body Validation with Custom Rules) ====================

export const signUpSchema: SchemaType = {
  body: z.object({
    username: z.string().min(3),
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

    const names = data.username?.trim().split(/\s+/) || [];
    if (names.length !== 2) {
      ctx.addIssue({
        code: "custom",
        path: ["username"],
        message: "Username must be exactly two words",
      });
    }
  })
};



// ==================== Login Schema ====================
export const loginSchema: SchemaType = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  })
};


// ==================== Placeholder / Not Implemented – Send Friend Request Schema ====================

export function sendFriendRequestSchema(sendFriendRequestSchema: any): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
  throw new Error("Function not implemented.");
}