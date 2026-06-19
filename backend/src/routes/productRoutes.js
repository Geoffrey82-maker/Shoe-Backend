import express from "express";

import { createProduct, getProducts, getProductBySlug, createReview } from "../controllers/productsContoller.js";

import { productValidation } from "../validators/productValidator.js";

import validate from "../middleware/validationMiddlware.js";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get('/', getProducts);
    
router.post('/', protect, admin, upload.array("images", 10), createProduct);

router.post("/:id/reviews", protect, createReview);
    
router.get('/:slug', getProductBySlug);

export default router;