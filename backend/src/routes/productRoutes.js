import express from "express";

import { 
    createProduct, 
    updateProduct,
    deleteProduct,
    getProducts,
    getProductById,
    getProductBySlug, 
    createReview } from "../controllers/productsContoller.js";

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
    reviewValidation,
    validate,
    createReview
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