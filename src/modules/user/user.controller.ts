// src/modules/user/user.controller.ts
import { Request, Response } from "express";
import { fetchUsers, createUser as createUserService } from "./user.service";
import { createUserSchema } from "./user.schema";
import { AppError } from "../../utils/AppError";

// GET /users
export const getUsers = async (req: Request, res: Response) => {
  const users = await fetchUsers();
  res.status(200).json(users);
};

// POST /users
export const createUser = async (req: Request, res: Response) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues.map((i) => i.message).join(", "), 400);
  }

  const newUser = await createUserService(result.data.name);
  res.status(201).json(newUser);
};