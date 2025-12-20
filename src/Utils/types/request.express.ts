


declare module "express-serve-static-core" {
    interface Request {
        user?:HUserDocument;
        decoded?:JwtPayload;
    }
}