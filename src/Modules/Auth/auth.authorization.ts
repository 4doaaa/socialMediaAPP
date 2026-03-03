import { RoleEnum } from "../../DB/models/user.model";

export const endpoint = {
    image: [RoleEnum.USER, RoleEnum.ADMIN]
};