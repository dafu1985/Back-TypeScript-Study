// src/modules/user/user.routes.ts
import { Router } from "express";
import { getUsers,getUser, updateUser, deleteUser } from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { updateUserSchema } from "./user.schema";

const router = Router();

router.get("/", authMiddleware,asyncHandler(getUsers));
router.get("/:id", authMiddleware, asyncHandler(getUser));

router.patch("/:id", authMiddleware, validate(updateUserSchema), asyncHandler(updateUser));
router.delete("/:id", authMiddleware, asyncHandler(deleteUser));

export default router;