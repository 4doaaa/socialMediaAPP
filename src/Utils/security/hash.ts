import {hash , compare} from "bcrypt";

// ==================== generate Hash ====================

export const generateHash = async (plainText:string , saltRounds: number = Number(process.env.SALT)
):Promise<string> => {
    return await hash(plainText , saltRounds);
};

// ==================== compare Hash ====================

export const compareHash = async (plainText:string , hash: string
):Promise<boolean> => {
    return await compare(plainText , hash);
};