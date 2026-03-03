// ==================== Module Imports & Dependencies ====================

import { Socket } from "socket.io";
import { HUserDocument } from "../Auth/auth.service";
import { JwtPayload } from "jsonwebtoken";


// ==================== Extended Socket Interface – Authenticated Socket ====================

export interface IAuthSocket extends Socket {
    credentials?: {
        user: Partial<HUserDocument>
        decoded: JwtPayload;
    }
}