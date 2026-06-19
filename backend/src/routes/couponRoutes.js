import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import { createCoupon, validateCoupon, getCoupons, toggleCouponStatus, deleteCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.get("/", protect, getCoupons);

router.post('/', protect, admin, createCoupon);

router.post("/validate", protect, admin, validateCoupon);

router.put("/:id/toggle", protect, admin, toggleCouponStatus);

router.delete("/:id", protect, admin, deleteCoupon );

export default router;