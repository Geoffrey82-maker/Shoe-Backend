import express from "express";

import protect from "../middleware/authMiddleware.js";

import {

    addToWishlist,

    removeFromWishlist,

    getWishlist,

    getWishlistCount

}

from "../controllers/wishlistController.js";

const router = express.Router();

router.get(

    "/",

    protect,

    getWishlist

);

router.get(

    "/count",

    protect,

    getWishlistCount

);

router.post(

    "/:productId",

    protect,

    addToWishlist

);

router.delete(

    "/:productId",

    protect,

    removeFromWishlist

);

export default router;