import { Router } from "express";
import { register, login} from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));


export default router;