import { Request, Response } from "express";

// ==================== Authentication Service Class ====================

class UserService {
    constructor() {}

    getProfile = async (req: Request, res: Response): Promise<Response> => {
        const authReq = req as IAuthRequest;
        return res.status(200).json({
             message:"Done" ,
             data:{user: authReq.user , decoded:authReq.decoded}
         });
};
}
// ==================== Export Service Instance & Type ====================

export default new UserService();
