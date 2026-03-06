// src/modules/user/user.routes.ts
import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createUserSchema, updateUserSchema } from "./user.schema";

const router = Router();

router.get("/", asyncHandler(getUsers));
router.post("/", validate(createUserSchema), asyncHandler(createUser));

router.patch("/:id", validate(updateUserSchema), asyncHandler(updateUser));
router.delete("/:id", asyncHandler(deleteUser));


export default router;