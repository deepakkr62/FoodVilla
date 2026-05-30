import { Router } from "express";
import {
  createMyRestaurant,
  getMyRestaurant,
  getRestaurantById,
  listRestaurants,
  updateMyRestaurant,
} from "../controllers/restaurantController";
import {
  createDish,
  deleteDish,
  listMyDishes,
  updateDish,
} from "../controllers/dishController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public
router.get("/restaurants", listRestaurants);
router.get("/restaurants/:id", getRestaurantById);

// Owner-only
const ownerOnly = [requireAuth, requireRole("restaurant_owner")];

router.get("/owner/restaurant", ownerOnly, getMyRestaurant);
router.post("/owner/restaurant", ownerOnly, createMyRestaurant);
router.put("/owner/restaurant", ownerOnly, updateMyRestaurant);

router.get("/owner/dishes", ownerOnly, listMyDishes);
router.post("/owner/dishes", ownerOnly, createDish);
router.put("/owner/dishes/:id", ownerOnly, updateDish);
router.delete("/owner/dishes/:id", ownerOnly, deleteDish);

export default router;
