// ==================== Import User Roles Enum ====================
import { RoleEnum } from "../../DB/models/user.model";

// ==================== Define Access Roles Per Endpoint ====================
export const endpoint = {
// ==================== Create Comment Authorization Roles ====================
    createComment: [RoleEnum.USER, RoleEnum.ADMIN],
};