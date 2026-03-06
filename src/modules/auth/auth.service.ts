// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma";
import { AppError } from "../../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// ユーザー登録
export const register = async (name: string, email: string, password: string) => {
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return { id: user.id, name: user.name, email: user.email };
};

// ログイン
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

  return { token };
};