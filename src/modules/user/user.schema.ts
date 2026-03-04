// src/modules/user/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "name is required")
    .max(1000, "name must be 1000 characters or less") // 長すぎる場合弾く
    .transform((val) => val.trim()), // 空白のみの場合も弾く
});