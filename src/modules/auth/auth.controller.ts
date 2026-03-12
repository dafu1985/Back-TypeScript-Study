// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { register as registerService, login as loginService, refresh as refreshService, logout as logoutService } from "./auth.service";
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

    // POST /auth/refresh
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const result = await refreshService(refreshToken);
  res.json(result);
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  // ここを書いてみてください
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues.map((i) => i.message).join(", "), 400);
  }

const { accessToken, refreshToken } = await loginService(result.data.email, result.data.password);
res.json({ accessToken, refreshToken });
};

// POST /auth/logout
export const logout = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  await logoutService(userId);
  res.json({ message: "Logged out successfully" });
};