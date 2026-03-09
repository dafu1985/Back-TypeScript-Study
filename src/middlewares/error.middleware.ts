import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // AppErrorの場合
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Prismaのエラーの場合
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // レコードが見つからない
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    // ユニーク制約違反（emailの重複など）
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "Already exists",
      });
    }
  }

  // 想定外エラー
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};