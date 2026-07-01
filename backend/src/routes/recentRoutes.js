import express from "express";

import protect from "../middleware/authMiddleware.js";

import{
    addRecentlyViewed,
    getRecentlyViewed
} from "../controllers/recentlyViewedController.js";

const router = express.Router();

router.get(
    "/",
    protect,
    getRecentlyViewed
);

router.post(
    "/:productId",
    protect,
    addRecentlyViewed
);

export default router;