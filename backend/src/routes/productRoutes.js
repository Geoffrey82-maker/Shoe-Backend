import express from "express";

import { 
    createProduct, 
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById,
    getProductBySlug, 
    createReview,
    deleteReview,
    updateReview,
    voteReviewHelpful } from "../controllers/productsContoller.js";

import { productValidation } from "../validators/productValidator.js";

import validate from "../middleware/validationMiddlware.js";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { reviewValidation } from "../validators/reviewValidator.js";

const router = express.Router();

router.get('/', getProducts);
    
router.post(
    '/', 
    protect, 
    admin, 
    upload.array("images", 10), 
    createProduct
);

router.post(
    "/:id/reviews",
    protect,
    upload.array("images", 5),
    reviewValidation,
    validate,
    createReview
);

router.put(
    "/:productId/reviews/:reviewId",
    protect,
    updateReview
);

router.put(

    "/:productId/reviews/:reviewId/helpful",

    protect,

    voteReviewHelpful

);

router.delete(
    "/:productId/reviews/:reviewId",
    protect,
    deleteReview
);

router.put(
    "/:id",
    protect,
    admin,
    updateProduct
);

router.delete(
    "/:id",
    protect,
    admin,
    deleteProduct
);

router.get('/id/:id', getProductById);

router.get('/:slug', getProductBySlug);

export default router;