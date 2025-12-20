"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserService {
    constructor() { }
    getProfile = async (req, res) => {
        const authReq = req;
        return res.status(200).json({
            message: "Done",
            data: { user: authReq.user, decoded: authReq.decoded }
        });
    };
}
exports.default = new UserService();
