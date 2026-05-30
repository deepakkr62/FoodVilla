import { Router } from "express";
import { updateProfile } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.patch("/users/me", requireAuth, updateProfile);

export default router;
