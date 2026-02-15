// ==================== Import Dependencies & Types ====================
import { NextFunction, Request, Response } from "express";
import { RoleEnum } from "../DB/models/user.model";
import { BadRequestException ,ForbiddenException } from "../Utils/response/error.response";
import { decodedToken ,tokenTypeEnum } from "../Utils/security/token";

// ==================== Authentication Middleware Definition ====================

export const authentication = (
allowedRoles: RoleEnum[] = [], ACCESS: tokenTypeEnum, p0: never[], options: { tokenType?: tokenTypeEnum; } = { tokenType: tokenTypeEnum.ACCESS }) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        
// ==================== Authorization Header Presence Check ====================
        if (!req.headers.authorization) {
            throw new BadRequestException("Missing Authorization Header");
        }

// ==================== Token Decoding & User Verification ====================
       const { decoded, user } = await decodedToken({
  authorization: req.headers.authorization,
  tokenType: options.tokenType ?? tokenTypeEnum.ACCESS,  
});

// ==================== Role-Based Access Control (RBAC) Validation ====================
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
  throw new ForbiddenException("You are not authorized to access this route");
}

// ==================== Request Context Population & Proceeding ====================
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};