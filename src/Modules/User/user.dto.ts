// ==================== Zod Import ====================
import z from 'zod';
import { logoutSchema } from './user.validation';

// ==================== Logout Data Transfer Object Type ====================
export type LogoutDTO = z.infer<typeof logoutSchema.body>;