// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { register as registerService, login as loginService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { AppError } from "../../utils/AppError";

// POST /auth/register
export const register = async (req: Request, res: Response) => {
  // ここを書いてみてください  
  const result = registerSchema.safeParse(req.body);
  
    if (!result.success) {
      throw new AppError(result.error.issues.map((i) => i.message).join(", "), 400);
    }
  
    const newUser = await registerService(result.data.name, result.data.email, result.data.password);
    res.status(201).json(newUser);
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  // ここを書いてみてください
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues.map((i) => i.message).join(", "), 400);
  }

  const { token } = await loginService(result.data.email, result.data.password);
  res.json({ token });
};