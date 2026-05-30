import { Router } from "express";
import {
  createReview,
  getReviewForOrder,
  listRestaurantReviews,
} from "../controllers/reviewController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/restaurants/:id/reviews", listRestaurantReviews);
router.post("/reviews", requireAuth, requireRole("customer"), createReview);
router.get("/orders/:id/review", requireAuth, requireRole("customer"), getReviewForOrder);

export default router;
