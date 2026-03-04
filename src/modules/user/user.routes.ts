// src/modules/user/user.routes.ts
import { Router } from "express";
import { getUsers, createUser } from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createUserSchema } from "./user.schema";

const router = Router();

router.get("/", asyncHandler(getUsers));
router.post("/", validate(createUserSchema), asyncHandler(createUser));

export default router;