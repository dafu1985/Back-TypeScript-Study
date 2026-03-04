import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";  // 旧 ZodSchema の代わり
import { AppError } from "../utils/AppError";

export const validate =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err?.issues) {
        const message = err.issues.map((i: any) => i.message).join(", ");
        return next(new AppError(message, 400));  // 型に合わせて順番修正
      }
      next(err);
    }
  };