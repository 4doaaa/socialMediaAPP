
import { RoleEnum } from "../../DB/models/user.model";


// ==================== Authorization Endpoints & Required Roles ====================

export const endpoint = {
    profile: [RoleEnum.USER,RoleEnum.ADMIN],
    logout: [RoleEnum.USER,RoleEnum.ADMIN],
    refreshToken: [RoleEnum.USER,RoleEnum.ADMIN],
    friendRequest: [RoleEnum.USER],
    acceptFriend: [RoleEnum.USER],
};