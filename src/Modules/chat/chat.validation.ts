// ==================== Module Imports & Dependencies ====================

import z from "zod";
import { generalFields } from "../../Middlewares/validation.middleware";


// ==================== Zod Schema – Get Private Chat (Params Validation) ====================

export const getChatSchema = {
    params: z.strictObject({
        userId: generalFields.id,
    }),
};


// ==================== Zod Schema – Get Group Chat (Params Validation) ====================

export const getGroupChatSchema = {
    params: z.strictObject({
        groupId: generalFields.id,
    }),
};


// ==================== Zod Schema – Create Group Chat (Body Validation) ====================

export const createGroupChatSchema = {
    body: z.strictObject({
        participants: z.array(z.string()).min(1),
        group: z.string().min(1).max(100),
    }).superRefine((data, ctx) => {
        if (
            data.participants?.length &&
            data.participants.length !== [new Set(data.participants)].length
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["participants"],
                message: "Duplicate participants are not allowed",
            });
        }
    }),
};