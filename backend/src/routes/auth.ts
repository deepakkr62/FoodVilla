import { Router } from "express";
import { login, logout, me, refresh, signup } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/refresh", refresh);
router.get("/auth/me", requireAuth, me);

export default router;
