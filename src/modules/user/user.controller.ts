// src/modules/user/user.controller.ts
import { Request, Response } from "express";
import { fetchUsers, updateUser as updateUserService, deleteUser as deleteUserService } from "./user.service";

// GET /users
export const getUsers = async (req: Request, res: Response) => {
  const users = await fetchUsers();
  res.status(200).json(users);
};

// POST /users
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