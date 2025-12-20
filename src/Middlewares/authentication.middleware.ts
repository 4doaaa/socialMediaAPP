import { NextFunction, Request, Response } from "express";
import { RoleEnum } from "../DB/models/user.model";
import { BadRequestException ,ForbiddenException } from "../Utils/response/error.response";
import { decodedToken ,tokenTypeEnum } from "../Utils/security/token";

// ==================== Authentication Middleware ====================

export const authentication = ({
    tokenType = tokenTypeEnum.ACCESS,
    accessRoles,
}:{
    tokenType?: tokenTypeEnum;
    accessRoles: RoleEnum[];
}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
       
        if (!req.headers.authorization) {
            throw new BadRequestException("Missing Authorization Header");
        }
        const { decoded, user } = await decodedToken({
            authorization: req.headers.authorization,
            tokenType,
        });
        if (!accessRoles.includes(user.role)) {
            throw new ForbiddenException(
                "You are not authorized to access this route");
        };
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};