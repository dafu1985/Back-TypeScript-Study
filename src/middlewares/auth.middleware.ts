// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
  (req as any).userId = decoded.userId;

  next();
};