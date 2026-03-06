// src/modules/user/user.controller.ts
import { Request, Response } from "express";
import { fetchUsers, createUser as createUserService, updateUser as updateUserService, deleteUser as deleteUserService } from "./user.service";
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

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const updatedUser = await updateUserService(id, req.body.name);

  res.status(200).json(updatedUser);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const deletedUser = await deleteUserService(id);

  res.status(200).json(deletedUser);
};