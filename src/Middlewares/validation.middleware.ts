// ==================== Import Dependencies & Types ====================
import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../Utils/response/error.response";
import { z } from "zod";
import { Types } from "mongoose";

// ==================== Type Definitions for Schema Validation ====================
type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, z.ZodTypeAny>>;

// ==================== General Reusable Validation Fields ====================
export const generalFields = {
// ==================== MongoDB ObjectId Validation ====================
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  }),
// ==================== File Object Validation (Multer) ====================
  file: (allowedExtensions: string[]) =>
    z.object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string().refine((m) => allowedExtensions.includes(m), {
        message: "File type not supported",
      }),
      size: z.number(),
      destination: z.string().optional(),
      filename: z.string().optional(),
      path: z.string().optional(),
      secure_url: z.string().optional(),
      public_id: z.string().optional(),
    }),
};

// ==================== Main Validation Middleware Function ====================
export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: any[] = [];

// ==================== Iterate & Parse Request Parts (Body, Params, Query) ====================
    for (const key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) continue;

      const result = schema[key]!.safeParse(req[key]);

      if (!result.success) {
        validationErrors.push(result.error.issues);
      }
    }

// ==================== Handle Validation Errors ====================
    if (validationErrors.length) {
      throw new BadRequestException("Validation Error", {
        cause: validationErrors,
      });
    }

    next();
  };
};