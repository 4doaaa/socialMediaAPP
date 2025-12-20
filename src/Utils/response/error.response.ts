import { NextFunction ,Request ,Response} from "express";

// ==================== Custom Error Interface ====================

export  interface IError extends Error {
    statusCode: number;
}

// ==================== Base Application Exception ====================

export class ApplicationException extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        options ?: ErrorOptions
    ) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

// ==================== Bad Request Exception (400) ====================

export class BadRequestException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 400, options);
        
    }
}

// ==================== Not Found Exception (404) ====================

export class NotFoundException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 404, options);
        
    }
}

// ==================== Conflict Exception (409) ====================

export class ConflictException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 409, options);
        
    }
}

// ==================== Unauthorized Exception (401) ====================

export class UnAuthorizedException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 401, options);
        
    }
}

// ==================== Forbidden Exception (403) ====================

export class ForbiddenException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 403, options);
        
    }
}

// ==================== Global Error Handler Middleware ====================

export const globalErrorHandler =(
    err:IError ,
    req: Request,
     res: Response ,
     next: NextFunction
    ) =>{
    return res.status(err.statusCode || 500).json({
        message: err.message || "Something Went Wrong",
        stack:process.env.MODE === "DEV"? err.stack : undefined,
        couse: err.cause,
    });
};