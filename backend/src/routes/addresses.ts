import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from "../controllers/addressController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/users/me/addresses", requireAuth, listAddresses);
router.post("/users/me/addresses", requireAuth, createAddress);
router.put("/users/me/addresses/:id", requireAuth, updateAddress);
router.delete("/users/me/addresses/:id", requireAuth, deleteAddress);

export default router;
